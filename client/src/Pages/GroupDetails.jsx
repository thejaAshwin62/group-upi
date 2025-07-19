"use client";

import { useState, useEffect } from "react";
import { BackgroundGradient } from "../components/background-gradient";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../components/hover-card";
import { SparklesCore } from "../components/sparkles";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-red-600 dark:text-red-500">
                  🗑️
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Remove Member
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Are you sure you want to remove{" "}
                <span className="font-semibold">{memberName}</span> from the
                group?
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-500/25"
              >
                Remove
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GroupDetails = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteMemberModal, setDeleteMemberModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: "",
  });

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const response = await customFetch.get(`/groups/${groupId}`);
      setGroupData(response.data.group);
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Failed to fetch group data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    setDeleteMemberModal({
      isOpen: true,
      memberId,
      memberName,
    });
  };

  const confirmRemoveMember = async () => {
    try {
      await customFetch.post(`/groups/${groupId}/remove-member`, {
        groupId,
        memberId: deleteMemberModal.memberId,
      });

      toast.success("Member removed successfully");

      // Refresh group data
      fetchGroupData();

      // Close modals
      setSelectedMember(null);
      setDeleteMemberModal({
        isOpen: false,
        memberId: null,
        memberName: "",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.msg || "Failed to remove member");
      setDeleteMemberModal({
        isOpen: false,
        memberId: null,
        memberName: "",
      });
    }
  };

  if (isLoading || !groupData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🔄</div>
      </div>
    );
  }

  const paidMembers = groupData.members.filter(
    (m) => m.status === "paid"
  ).length;
  const totalMembers = groupData.members.length;
  const amountPerPerson = groupData.totalAmount / totalMembers;
  const totalCollected = paidMembers * amountPerPerson;

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "payments", label: "Payments", icon: "💳" },
    { id: "activity", label: "Activity", icon: "📈" },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Jane Smith",
      action: "made payment",
      amount: 1875,
      time: "2 hours ago",
      type: "payment",
    },
    {
      id: 2,
      user: "Alex Chen",
      action: "joined group",
      time: "1 day ago",
      type: "join",
    },
    {
      id: 3,
      user: "John Doe",
      action: "updated UPI ID",
      time: "2 days ago",
      type: "update",
    },
    {
      id: 4,
      user: "Sarah Wilson",
      action: "made payment",
      amount: 1875,
      time: "3 days ago",
      type: "payment",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const handleEdit = () => {
    navigate(`/dashboard/update-group/${groupData.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <SparklesCore
        id="group-details-sparkles"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={25}
        className="w-full h-full"
        particleColor="#3B82F6"
      />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-4">
                {groupData.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>✈️ Travel</span>
                <span>•</span>
                <span>
                  Created {new Date(groupData.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>{totalMembers} members</span>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
              >
                📱 Scan QR
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-medium shadow-lg"
              >
                ✏️ Edit
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12"
        >
          {/* Large Amount Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-2"
          >
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 h-full flex flex-col justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ₹{(groupData.amount / 1000).toFixed(0)}K
                  </div>
                  <div className="text-gray-600 text-lg mb-4">Total Amount</div>
                  <div className="w-full bg-blue-100 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(totalCollected / groupData.amount) * 100}%`,
                      }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                    ></motion.div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    ₹{totalCollected.toLocaleString()} collected
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Progress Ring */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col justify-center items-center">
                <div className="relative w-20 h-20 mb-3">
                  <svg
                    className="w-20 h-20 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <motion.path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${
                        (paidMembers / totalMembers) * 100
                      }, 100`}
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{
                        strokeDasharray: `${
                          (paidMembers / totalMembers) * 100
                        }, 100`,
                      }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {Math.round((paidMembers / totalMembers) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {paidMembers}/{totalMembers}
                  </div>
                  <div className="text-xs text-gray-500">Paid</div>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Per Person */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col justify-center text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ₹{Math.round(amountPerPerson)}
                </div>
                <div className="text-gray-600 text-sm">Per Person</div>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-2"
          >
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h4>
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "payment"
                            ? "bg-green-500"
                            : activity.type === "join"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                      ></div>
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-gray-600">
                          {" "}
                          {activity.action}
                        </span>
                        {activity.amount && (
                          <span className="text-green-600">
                            {" "}
                            ₹{activity.amount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/80"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <BackgroundGradient className="rounded-3xl p-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">
                    Group Overview
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Group Info */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-6 bg-blue-50 rounded-2xl">
                        <h4 className="font-semibold text-blue-900 mb-4">
                          Group Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Name:</strong> {groupData.name}
                          </div>
                          <div>
                            <strong>Category:</strong> Travel ✈️
                          </div>
                          <div>
                            <strong>Total Amount:</strong> ₹
                            {groupData.amount.toLocaleString()}
                          </div>
                          <div>
                            <strong>Per Person:</strong> ₹
                            {Math.round(amountPerPerson)}
                          </div>
                          <div className="md:col-span-2">
                            <strong>Description:</strong>{" "}
                            {groupData.description}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-green-50 rounded-2xl">
                        <h4 className="font-semibold text-green-900 mb-4">
                          Payment Summary
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              ₹{totalCollected.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-700">
                              Collected
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              ₹
                              {(
                                groupData.amount - totalCollected
                              ).toLocaleString()}
                            </div>
                            <div className="text-sm text-orange-700">
                              Pending
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {paidMembers}
                            </div>
                            <div className="text-sm text-blue-700">Paid</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {totalMembers - paidMembers}
                            </div>
                            <div className="text-sm text-purple-700">
                              Pending
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                      <div className="p-6 bg-purple-50 rounded-2xl">
                        <h4 className="font-semibold text-purple-900 mb-4">
                          Quick Actions
                        </h4>
                        <div className="space-y-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            📱 Scan QR Code
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            ➕ Add Member
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            📊 Export Data
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            💬 Send Reminder
                          </motion.button>
                        </div>
                      </div>

                      <div className="p-6 bg-gray-50 rounded-2xl">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Group Stats
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>Average payment time:</span>
                            <span className="font-medium">2.3 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Most active member:</span>
                            <span className="font-medium">Jane Smith</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Group created:</span>
                            <span className="font-medium">5 days ago</span>
                          </div>
                        </div>
                      </div>
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
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-bold text-gray-900">
                      Members ({totalMembers})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg"
                    >
                      ➕ Add Member
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupData.members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 relative group"
                      >
                        {/* Delete and Options Buttons - Now always visible with hover effect */}
                        <div className="absolute right-4 top-4 flex gap-2 transition-all duration-300">
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveMember(member.userId, member.name)}
                            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors shadow-sm hover:shadow-md"
                            title="Remove member"
                          >
                            🗑️
                          </motion.button>
                          <HoverCard>
                            <HoverCardTrigger>
                              <button className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors shadow-sm hover:shadow-md">
                                ⋮
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <div className="space-y-2 min-w-[120px]">
                                <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">
                                  Edit Member
                                </button>
                                <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">
                                  Send Reminder
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.userId, member.name)}
                                  className="block w-full text-left px-3 py-2 hover:bg-red-50 rounded text-red-600 text-sm"
                                >
                                  Remove Member
                                </button>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>

                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              member.status === "paid"
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-orange-400 to-orange-600"
                            }`}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {member.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {member.upiId}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">
                              ₹{member.amount}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                member.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {member.status === "paid"
                                ? "✅ Paid"
                                : "⏳ Pending"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Last seen: {member.lastSeen}
                          </div>
                        </div>
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
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-bold text-gray-900">
                    Payment Status
                  </h3>

                  <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>
                        Progress: {paidMembers}/{totalMembers} paid
                      </span>
                      <span>
                        {Math.round((paidMembers / totalMembers) * 100)}%
                        complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(paidMembers / totalMembers) * 100}%`,
                        }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full flex items-center justify-end pr-2"
                      >
                        <span className="text-white text-xs font-medium">
                          {Math.round((paidMembers / totalMembers) * 100)}%
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {groupData.members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              member.status === "paid"
                                ? "bg-green-500"
                                : "bg-orange-500"
                            }`}
                          ></div>
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              member.status === "paid"
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-orange-400 to-orange-600"
                            }`}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {member.upiId}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold text-xl text-gray-900">
                              ₹{member.amount}
                            </div>
                            <div
                              className={`text-sm ${
                                member.status === "paid"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {member.status === "paid"
                                ? "✅ Paid"
                                : "⏳ Pending"}
                            </div>
                          </div>

                          {member.status === "pending" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                            >
                              Send Reminder
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-bold text-gray-900">
                    Recent Activity
                  </h3>

                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
                            activity.type === "payment"
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : activity.type === "join"
                              ? "bg-gradient-to-r from-blue-400 to-blue-600"
                              : "bg-gradient-to-r from-orange-400 to-orange-600"
                          }`}
                        >
                          {activity.type === "payment"
                            ? "💳"
                            : activity.type === "join"
                            ? "👋"
                            : "✏️"}
                        </div>

                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {activity.user} {activity.action}
                            {activity.amount && (
                              <span className="text-green-600">
                                {" "}
                                ₹{activity.amount}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {activity.time}
                          </div>
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            activity.type === "payment"
                              ? "bg-green-100 text-green-800"
                              : activity.type === "join"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {activity.type}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </BackgroundGradient>

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 ${
                      selectedMember.status === "paid"
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : "bg-gradient-to-r from-orange-400 to-orange-600"
                    }`}
                  >
                    {selectedMember.avatar}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedMember.name}
                  </h3>
                  <p className="text-gray-600">{selectedMember.upiId}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      ₹{selectedMember.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-semibold ${
                        selectedMember.status === "paid"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {selectedMember.status === "paid"
                        ? "✅ Paid"
                        : "⏳ Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last seen:</span>
                    <span className="font-semibold">
                      {selectedMember.lastSeen}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMember(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Member Confirmation Modal */}
        <DeleteMemberModal
          isOpen={deleteMemberModal.isOpen}
          onClose={() =>
            setDeleteMemberModal({
              isOpen: false,
              memberId: null,
              memberName: "",
            })
          }
          onConfirm={confirmRemoveMember}
          memberName={deleteMemberModal.memberName}
        />
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default GroupDetails;
