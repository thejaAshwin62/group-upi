"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ViewGroup = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    shopUpiId: "",
    totalAmount: "",
  });
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [leaveGroupModal, setLeaveGroupModal] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [userData, setUserData] = useState(null);
  const [deleteMemberModal, setDeleteMemberModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: "",
  });
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  const fetchGroupDetails = async () => {
    try {
      const response = await customFetch.get(`/groups/${groupId}`);
      setGroupData(response.data.group);
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await customFetch.get("/auth/current-user");
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchGroupDetails(), fetchUserData()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    try {
      const response = await customFetch.post(
        "/payments/process-shop-payment",
        {
          groupId,
          shopUpiId: paymentForm.shopUpiId,
          totalAmount: Number(paymentForm.totalAmount),
        }
      );
      setPaymentData(response.data);
      setShowPaymentModal(false);
      setActiveTab("payments");
      await fetchGroupDetails();
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleUpiPayment = (upiLink) => {
    window.location.href = upiLink;
  };

  const deleteMember = async (memberId, memberName) => {
    setDeleteMemberModal({
      isOpen: true,
      memberId,
      memberName,
    });
  };

  const confirmDeleteMember = async () => {
    setIsDeletingMember(true);
    try {
      await customFetch.delete("/groups", {
        data: {
          groupId,
          memberId: deleteMemberModal.memberId,
        },
      });
      await fetchGroupDetails();
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member. Please try again.");
    } finally {
      setIsDeletingMember(false);
      setDeleteMemberModal({
        isOpen: false,
        memberId: null,
        memberName: "",
      });
    }
  };

  const handleAddMembers = async (memberIds) => {
    if (!memberIds.length) return;
    setIsAddingMembers(true);
    try {
      await customFetch.post(`/groups/${groupId}/members`, {
        memberIds,
      });
      toast.success("Members added successfully");
      await fetchGroupDetails();
      setAddMemberModal(false);
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error(error.response?.data?.msg || "Failed to add members");
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleLeaveGroup = async () => {
    setIsLeavingGroup(true);
    try {
      await customFetch.post(`/groups/${groupId}/leave`);
      toast.success("Successfully left the group");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error(error.response?.data?.msg || "Failed to leave group");
    } finally {
      setIsLeavingGroup(false);
      setLeaveGroupModal(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "payments", label: "Payments", icon: "💳" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-4xl">🔄</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px]">
                {groupData?.name}
              </h1>
              <p className="text-xs text-gray-500">
                {groupData?.memberCount} members
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            Add Payment
          </button>
        </div>
      </div>

      {/* Group Info Card */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {groupData?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {groupData?.name}
            </h2>
            <p className="text-sm text-gray-500">
              Created by {groupData?.owner?.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              ₹{groupData?.totalAmount || 0}
            </p>
            <p className="text-xs text-blue-600 font-medium">Total Amount</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {groupData?.memberCount || 0}
            </p>
            <p className="text-xs text-green-600 font-medium">Members</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {/* Group Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Group Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(groupData?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Owner</span>
                    <span className="text-sm font-medium text-gray-900">
                      {groupData?.owner?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="text-sm font-medium text-gray-900 truncate ml-2">
                      {groupData?.owner?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    💳 Add Payment
                  </button>
                  {groupData?.owner?.userId !== userData?._id && (
                    <button
                      onClick={() => setLeaveGroupModal(true)}
                      disabled={isLeavingGroup}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLeavingGroup ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                          Leaving...
                        </>
                      ) : (
                        <>👋 Leave Group</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {/* Group Members Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Group Members
                  </h3>
                  <button
                    onClick={() => setAddMemberModal(true)}
                    disabled={isAddingMembers}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAddingMembers ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <span>+</span> Add Member
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {groupData?.members?.map((member, index) => (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                  >
                    {/* Member Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {member.name}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {member.email}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMember(member.userId, member.name)}
                        disabled={isDeletingMember}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Amount Section */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{member.amount || 0}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                        Pay Now
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
                        Remind
                      </button>
                    </div>

                    {/* UPI Link if available */}
                    {member.upiLink && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">UPI ID:</p>
                        <p className="text-xs font-mono text-blue-600 break-all bg-blue-50 p-2 rounded">
                          {member.upiLink}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {!paymentData ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">💳</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Process Group Payment
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Enter payment details to split among members
                    </p>
                  </div>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop UPI ID
                      </label>
                      <input
                        type="text"
                        value={paymentForm.shopUpiId}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            shopUpiId: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter merchant UPI ID"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={paymentForm.totalAmount}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            totalAmount: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter total amount"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingPayment ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        "Process Payment"
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Total Amount:
                        </span>
                        <span className="font-bold text-gray-900">
                          ₹{paymentData.totalAmount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Shop UPI:</span>
                        <span className="font-mono text-gray-900 text-sm truncate ml-2">
                          {paymentData.shopUpiId}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleUpiPayment(paymentData.groupUpiLink)
                        }
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                      >
                        Pay Full Amount (₹{paymentData.totalAmount})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 px-1">
                      Individual Payments
                    </h3>
                    {paymentData.members.map((member) => (
                      <div
                        key={member._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {member.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Individual Share
                            </p>
                          </div>
                          <span className="font-bold text-lg text-gray-900">
                            ₹{member.amount}
                          </span>
                        </div>
                        <button
                          onClick={() => handleUpiPayment(member.upiLink)}
                          className="w-full px-4 py-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                        >
                          Pay Share
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop UPI ID
                  </label>
                  <input
                    type="text"
                    value={paymentForm.shopUpiId}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        shopUpiId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter merchant UPI ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.totalAmount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        totalAmount: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter total amount"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    "Process Payment"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Member Modal */}
      <DeleteMemberModal
        isOpen={deleteMemberModal.isOpen}
        onClose={() =>
          setDeleteMemberModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmDeleteMember}
        memberName={deleteMemberModal.memberName}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={addMemberModal}
        onClose={() => setAddMemberModal(false)}
        onConfirm={handleAddMembers}
      />

      {/* Leave Group Modal */}
      <LeaveGroupModal
        isOpen={leaveGroupModal}
        onClose={() => setLeaveGroupModal(false)}
        onConfirm={handleLeaveGroup}
        groupName={groupData?.name}
      />
    </div>
  );
};

const DeleteMemberModal = ({ isOpen, onClose, onConfirm, memberName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Remove Member
              </h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to remove{" "}
                <span className="font-semibold">{memberName}</span> from the
                group?
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AddMemberModal = ({ isOpen, onClose, onConfirm }) => {
  const [memberIds, setMemberIds] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const ids = memberIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);
    onConfirm(ids);
    setMemberIds("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Add Members
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Enter member IDs separated by commas
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={memberIds}
                onChange={(e) => setMemberIds(e.target.value)}
                placeholder="e.g. 684ef067b2d541f888468d14, 684ef..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20"
                rows={3}
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Members
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LeaveGroupModal = ({ isOpen, onClose, onConfirm, groupName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Leave Group
              </h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to leave{" "}
                <span className="font-semibold">{groupName}</span>? You'll need
                to be added back by the group owner.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Leave Group
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewGroup;
