import { StatusCodes } from "http-status-codes";
import User from "../models/userSchema.js";
import { hashPassword, comparePassword } from "../utils/passwordutils.js";
import { createJWT } from "../utils/tokenUtils.js";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Group from "../models/groupSchema.js";

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
    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
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
