import Group from "../models/groupSchema.js";
import User from "../models/userSchema.js";
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "../errors/customErrors.js";

export const createGroup = async (req, res) => {
  const { groupName, memberIds } = req.body;

  if (!groupName || !Array.isArray(memberIds) || memberIds.length === 0) {
    throw new BadRequestError("groupName and memberIds (array) are required");
  }

  try {
    // Verify all members exist in the database
    const members = await User.find({ _id: { $in: memberIds } });

    if (members.length !== memberIds.length) {
      throw new BadRequestError("One or more users not found");
    }

    // Create member objects with user references
    const memberObjects = members.map((user) => ({
      user: user._id,
    }));

    // Create group with authenticated user as owner
    const group = await Group.create({
      name: groupName,
      members: memberObjects,
      owner: req.user.userId, // Changed from req.user._id to req.user.userId
    });

    // Populate user details in response
    await group.populate("members.user", "name email");
    await group.populate("owner", "name email");

    res.status(201).json({ group });
  } catch (err) {
    console.error("Error creating group:", err);
    throw err;
  }
};

export const getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId)
      .populate("members.user", "name email phone ") // Populate member details
      .populate("owner", "name email phone"); // Populate owner details

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Format member details
    const formattedMembers = group.members.map((member) => ({
      userId: member.user._id,
      name: member.user.name,
      email: member.user.email,
      phone: member.user.phone,
      amount: member.amount || 0,
      upiLink: member.upiLink || null,
    }));

    // Structure the response
    const groupDetails = {
      _id: group._id,
      name: group.name,
      upiLink: group.upiLink || null, // Added upiLink to response
      totalAmount: group.totalAmount,
      createdAt: group.createdAt,
      owner: {
        userId: group.owner._id,
        name: group.owner.name,
        email: group.owner.email,
        phone: group.owner.phone,
      },
      members: formattedMembers,
      memberCount: formattedMembers.length,
    };

    res.status(200).json({ group: groupDetails });
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
};

export const updateGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  const { name, amount, memberIds } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Verify user has permission (owner or admin)
    if (
      group.owner.toString() !== req.user.userId.toString() && // Changed from req.user._id
      req.user.role !== "admin"
    ) {
      throw new UnauthorizedError("Not authorized to update this group");
    }

    if (name) group.name = name;
    if (amount !== undefined) group.totalAmount = amount;

    if (memberIds) {
      // Verify all new members exist
      const members = await User.find({ _id: { $in: memberIds } });

      if (members.length !== memberIds.length) {
        throw new BadRequestError("One or more users not found");
      }

      // Update members array
      group.members = members.map((user) => ({
        user: user._id,
      }));
    }

    await group.save();

    // Populate user details in response
    await group.populate("members.user", "name email");
    await group.populate("owner", "name email");

    return res.json(group);
  } catch (error) {
    console.error("Error updating group details:", error);
    throw error;
  }
};

export const addMembers = async (req, res) => {
  const { memberIds } = req.body;
  const { groupId } = req.params;

  if (!groupId || !Array.isArray(memberIds) || memberIds.length === 0) {
    throw new BadRequestError("groupId and memberIds array are required");
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Verify user has permission
    if (
      group.owner.toString() !== req.user.userId.toString() && // Changed from req.user._id
      req.user.role !== "admin"
    ) {
      throw new UnauthorizedError("Not authorized to update this group");
    }

    // Verify all new members exist
    const newMembers = await User.find({ _id: { $in: memberIds } });

    if (newMembers.length !== memberIds.length) {
      throw new BadRequestError("One or more users not found");
    }

    // Check for duplicates
    const existingMemberIds = group.members.map((m) => m.user.toString());
    const newMemberObjects = newMembers
      .filter((user) => !existingMemberIds.includes(user._id.toString()))
      .map((user) => ({
        user: user._id,
      }));

    if (newMemberObjects.length === 0) {
      return res.json({ message: "All members already in group", group });
    }

    group.members.push(...newMemberObjects);
    await group.save();

    // Populate user details in response
    await group.populate("members.user", "name email");
    await group.populate("owner", "name email");

    res.json({ message: "Members added successfully", group });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const removeMember = async (req, res) => {
  const { groupId, memberId } = req.body;

  if (!groupId || !memberId) {
    throw new BadRequestError("groupId and memberId are required");
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Verify user has permission
    if (
      group.owner.toString() !== req.user.userId.toString() && // Changed from req.user._id
      req.user.role !== "admin"
    ) {
      throw new UnauthorizedError("Not authorized to update this group");
    }

    // Remove member
    group.members = group.members.filter(
      (member) => member.user.toString() !== memberId
    );

    await group.save();

    // Populate user details in response
    await group.populate("members.user", "name email");
    await group.populate("owner", "name email");

    res.json({ message: "Member removed successfully", group });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
