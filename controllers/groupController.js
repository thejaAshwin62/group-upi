import Group from "../models/groupSchema.js";
import User from "../models/userSchema.js";
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "../errors/customErrors.js";

export const createGroup = async (req, res) => {
  const { groupName, memberUsernames } = req.body;

  if (
    !groupName ||
    !Array.isArray(memberUsernames) ||
    memberUsernames.length === 0
  ) {
    throw new BadRequestError(
      "groupName and memberUsernames (array) are required"
    );
  }

  try {
    // Verify all members exist in the database by username
    const members = await User.find({ name: { $in: memberUsernames } });

    if (members.length !== memberUsernames.length) {
      throw new BadRequestError("One or more usernames not found");
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
  const { name, amount, memberUsernames } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Verify user has permission (owner or admin)
    if (
      group.owner.toString() !== req.user.userId.toString() &&
      req.user.role !== "admin"
    ) {
      throw new UnauthorizedError("Not authorized to update this group");
    }

    if (name) group.name = name;
    if (amount !== undefined) group.totalAmount = amount;

    if (memberUsernames) {
      // Verify all new members exist
      const members = await User.find({ name: { $in: memberUsernames } });

      if (members.length !== memberUsernames.length) {
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
  const { memberUsernames } = req.body;
  const { groupId } = req.params;

  if (
    !groupId ||
    !Array.isArray(memberUsernames) ||
    memberUsernames.length === 0
  ) {
    throw new BadRequestError("groupId and memberUsernames array are required");
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Verify user has permission
    if (
      group.owner.toString() !== req.user.userId.toString() &&
      req.user.role !== "admin"
    ) {
      throw new UnauthorizedError("Not authorized to update this group");
    }

    // Find users by their usernames
    const newMembers = await User.find({ name: { $in: memberUsernames } });

    if (newMembers.length !== memberUsernames.length) {
      throw new BadRequestError("One or more usernames not found");
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

export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Verify user has permission
    if (
      group.owner.toString() !== req.user.userId.toString() &&
      req.user.role !== "admin"
    ) {
      throw new UnauthorizedError("Not authorized to delete this group");
    }

    await Group.findByIdAndDelete(groupId);

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    throw err;
  }
};

export const leaveGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Check if user is actually a member of the group
    const isMember = group.members.some(
      (member) => member.user.toString() === req.user.userId.toString()
    );

    if (!isMember) {
      throw new BadRequestError("You are not a member of this group");
    }

    // Don't allow the owner to leave their own group
    if (group.owner.toString() === req.user.userId.toString()) {
      throw new BadRequestError(
        "Group owner cannot leave the group. Please delete the group or transfer ownership instead."
      );
    }

    // Remove the member from the group
    group.members = group.members.filter(
      (member) => member.user.toString() !== req.user.userId.toString()
    );

    await group.save();

    // Populate user details in response
    await group.populate("members.user", "name email");
    await group.populate("owner", "name email");

    res.json({ message: "Successfully left the group", group });
  } catch (err) {
    console.error("Error leaving group:", err);
    throw err;
  }
};

export const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, amount, memberUsernames } = req.body;

  if (!name && amount === undefined && !memberUsernames) {
    throw new BadRequestError("Please provide at least one field to update");
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    // Verify user has permission
    if (
      group.owner.toString() !== req.user.userId.toString() &&
      req.user.role !== "admin"
    ) {
      throw new UnauthorizedError("Not authorized to update this group");
    }

    // Update name if provided
    if (name) {
      group.name = name;
    }

    // Update amount if provided
    if (amount !== undefined) {
      group.amount = amount;
    }

    // Update members if provided
    if (memberUsernames && Array.isArray(memberUsernames)) {
      // Find users by their usernames
      const members = await User.find({ name: { $in: memberUsernames } });

      if (members.length !== memberUsernames.length) {
        throw new BadRequestError("One or more usernames not found");
      }

      // Create member objects with user references
      const memberObjects = members.map((user) => ({
        user: user._id,
      }));

      group.members = memberObjects;
    }

    await group.save();

    // Populate user details in response
    await group.populate("members.user", "name email");
    await group.populate("owner", "name email");

    res.json({
      message: "Group updated successfully",
      group,
    });
  } catch (error) {
    console.error("Update group error:", error);
    throw error;
  }
};
