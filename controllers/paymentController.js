import Group from "../models/groupSchema.js";
import QRCode from "qrcode";

export const processShopPayment = async (req, res) => {
  const { groupId, shopUpiId, totalAmount } = req.body;

  if (!groupId || !shopUpiId || !totalAmount) {
    return res
      .status(400)
      .json({ error: "groupId, shopUpiId, and totalAmount are required" });
  }

  try {
    // Populate the user details when fetching the group
    const group = await Group.findById(groupId).populate(
      "members.user",
      "name"
    );
    if (!group) return res.status(404).json({ error: "Group not found" });

    const splitAmount = (totalAmount / group.members.length).toFixed(2);

    // Create the base UPI link for the group
    const groupUpiLink = `upi://pay?pa=${encodeURIComponent(
      shopUpiId
    )}&am=${totalAmount}&cu=INR`;

    // Update the group's total amount and UPI link
    group.totalAmount = totalAmount;
    group.upiLink = groupUpiLink;
    await group.save();

    const updatedMembers = await Promise.all(
      group.members.map(async (member) => {
        // Now member.user.name will be available because we populated it
        const memberUpiLink = `upi://pay?pa=${encodeURIComponent(
          shopUpiId
        )}&pn=${encodeURIComponent(member.user.name)}&am=${splitAmount}&cu=INR`;

        const qr = await QRCode.toDataURL(memberUpiLink);

        // Update member's amount and UPI link
        member.amount = splitAmount;
        member.upiLink = memberUpiLink;

        return {
          ...member.toObject(),
          name: member.user.name, // Include name in response
          upiLink: memberUpiLink,
          amount: splitAmount,
        //   qr,
        };
      })
    );

    // Save the updated members
    await group.save();

    res.json({
      groupName: group.name,
      shopUpiId,
      totalAmount,
      groupUpiLink,
      members: updatedMembers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error processing shop payment" });
  }
};

export const generateUpiLink = (req, res) => {
  const { upiId, name, amount } = req.body;
  if (!upiId || !name || !amount) {
    return res
      .status(400)
      .json({ error: "upiId, name, and amount are required" });
  }
  const upiLink = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
  res.json({ upiLink });
};

