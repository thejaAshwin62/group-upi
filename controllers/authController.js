import { StatusCodes } from "http-status-codes";
import User from "../models/userSchema.js";
import { hashPassword, comparePassword } from "../utils/passwordutils.js";
import { createJWT } from "../utils/tokenUtils.js";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Group from "../models/groupSchema.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

// Helper function to generate reset token
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  return { resetToken, hashedToken };
};

export const register = async (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new BadRequestError(
      "Please provide all required fields: email, password, name"
    );
  }

  try {
    const isFirstAccount = (await User.countDocuments()) === 0;
    req.body.role = isFirstAccount ? "admin" : "user";

    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const user = await User.create(req.body);

    // Don't send password in response
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(StatusCodes.CREATED).json({
      msg: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Invalid credentials",
      });
    }

    if (!req.body.email || !req.body.password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Email and password are required",
      });
    }

    // Check if user is locked out
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const waitTimeInSeconds = Math.ceil(
        (user.lockoutUntil - Date.now()) / 1000
      );
      return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        msg: `Account is temporarily locked. Please try again in ${waitTimeInSeconds} seconds.`,
        lockoutRemaining: waitTimeInSeconds,
      });
    }

    const isPasswordValid = await comparePassword(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      // Calculate progressive lockout duration
      let lockoutDuration = 0;
      const baseTime = 30; // Base lockout time in seconds

      if (user.failedLoginAttempts >= 4) {
        // Calculate lockout duration with exponential backoff, starting at 30 seconds
        const lockoutStep = Math.floor((user.failedLoginAttempts - 1) / 3);
        lockoutDuration = baseTime * Math.pow(2, lockoutStep);

        // Cap the maximum lockout time at 24 hours (86400 seconds)
        lockoutDuration = Math.min(lockoutDuration, 86400);

        user.lockoutUntil = Date.now() + lockoutDuration * 1000;
      }

      await user.save();

      if (lockoutDuration > 0) {
        // Convert duration to minutes or hours if it's large enough
        let timeMessage;
        if (lockoutDuration >= 3600) {
          timeMessage = `${Math.floor(lockoutDuration / 3600)} hours`;
        } else if (lockoutDuration >= 60) {
          timeMessage = `${Math.floor(lockoutDuration / 60)} minutes`;
        } else {
          timeMessage = `${lockoutDuration} seconds`;
        }

        return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          msg: `Too many failed attempts. Account is locked for ${timeMessage}.`,
          lockoutRemaining: lockoutDuration,
          nextLockoutDuration: lockoutDuration * 2,
        });
      }

      // Calculate remaining attempts before next lockout
      const attemptsUntilLock = 3 - ((user.failedLoginAttempts - 1) % 3);

      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Incorrect password",
        type: "PASSWORD_ERROR",
        attemptsRemaining: attemptsUntilLock,
        nextLockoutDuration:
          user.failedLoginAttempts >= 1
            ? baseTime * Math.pow(2, Math.floor(user.failedLoginAttempts / 3))
            : baseTime,
      });
    }

    // Reset ALL lockout-related data on successful login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null; // This line already resets the lockoutUntil
    user.lastLockoutDuration = 0;
    await user.save();

    const token = createJWT({ userId: user._id, role: user.role });
    const thirtyDays = 30000 * 60 * 60 * 24;

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + thirtyDays),
      secure: process.env.NODE_ENV === "production", // only on HTTPS in prod
      sameSite: "strict", // helps protect against CSRF
    });

    res.status(StatusCodes.OK).json({
      msg: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Something went wrong, please try again later",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Get user details excluding password
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Find all groups where user is a member or owner using proper MongoDB query
    const groups = await Group.find({
      $or: [
        { members: { $elemMatch: { user: user._id } } },
        { owner: user._id },
      ],
    })
      .populate("members.user", "name email")
      .populate("owner", "name email");

    // Categorize groups
    const ownedGroups = groups.filter(
      (group) => group.owner._id.toString() === user._id.toString()
    );

    const memberGroups = groups.filter(
      (group) => group.owner._id.toString() !== user._id.toString()
    );

    res.status(StatusCodes.OK).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      groups: {
        owned: ownedGroups.map((group) => ({
          _id: group._id,
          name: group.name,
          totalAmount: group.totalAmount,
          membersCount: group.members.length,
          createdAt: group.createdAt,
        })),
        joined: memberGroups.map((group) => ({
          _id: group._id,
          name: group.name,
          totalAmount: group.totalAmount,
          owner: group.owner.name,
          membersCount: group.members.length,
          createdAt: group.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if any field is provided to update
    const updates = {};
    if (name) updates.name = name;
    if (email && email !== user.email) {
      // Only check for duplicate email if it's being changed
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new BadRequestError("Email already in use");
      }
      updates.email = email;
    }
    if (phone) updates.phone = phone;

    // Check if there are any updates to make
    if (Object.keys(updates).length === 0) {
      throw new BadRequestError("Please provide at least one field to update");
    }

    // Update the user with only the provided fields
    Object.assign(user, updates);
    await user.save();

    // Return updated user without password
    res.status(StatusCodes.OK).json({
      msg: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Email already exists",
      });
    } else {
      throw error;
    }
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "User logged out!" });
};

export const validateUsername = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new BadRequestError("Username is required");
  }

  try {
    const user = await User.findOne({ name: username });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        valid: false,
        msg: "Username not found",
      });
    }

    // Don't send back sensitive user data, just confirm the username exists
    res.status(StatusCodes.OK).json({
      valid: true,
      msg: "Username is valid",
    });
  } catch (error) {
    console.error("Error validating username:", error);
    throw error;
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "User not found",
      });
    }

    const { resetToken, hashedToken } = generateResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
      const resetURL = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password/${resetToken}`;
      const message = `Forgot your password? Reset it using this link: \n\n ${resetURL}\n\nThis link will expire in 10 minutes.`;

      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      });

      res.status(StatusCodes.OK).json({
        msg: "Reset link sent to your email",
        // For testing purposes only, remove in production
        resetToken: resetToken,
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Error sending reset email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Something went wrong, please try again",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid or expired password reset token",
      });
    }

    if (!req.body.newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Please provide a new password",
      });
    }

    // Explicitly hash the new password
    user.password = await hashPassword(req.body.newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(StatusCodes.OK).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Something went wrong, please try again",
    });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError("Please provide both current and new password");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Current password is incorrect",
      });
    }

    // Hash and update new password
    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(StatusCodes.OK).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};
