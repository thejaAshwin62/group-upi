"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";

const UpdateGroup = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState("");
  const [amount, setAmount] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await customFetch.get(`/groups/${groupId}`);
        const group = response.data.group;
        setGroupName(group.name);
        setAmount(group.amount);
        setSelectedMembers(
          group.members.map((member) => ({
            id: member.userId,
          }))
        );
      } catch (error) {
        console.error("Error fetching group details:", error);
        toast.error("Failed to fetch group details");
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  const validateForm = () => {
    const newErrors = {};
    if (!groupName.trim()) {
      newErrors.groupName = "Group name is required";
    }
    // Only validate amount if it's being changed (not empty)
    if (amount !== "" && amount < 0) {
      newErrors.amount = "Amount cannot be negative";
    }
    // Only validate members if new ones are being added
    if (userIdInput.trim()) {
      if (selectedMembers.length < 2) {
        newErrors.members = "At least 2 members are required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addMember = (userId) => {
    if (!userId.trim()) return;
    if (selectedMembers.some((member) => member.id === userId)) {
      toast.error("Member already added");
      return;
    }
    setSelectedMembers([...selectedMembers, { id: userId }]);
    setUserIdInput("");
    if (errors.members) {
      setErrors({ ...errors, members: "" });
    }
  };

  const removeMember = (userId) => {
    setSelectedMembers(
      selectedMembers.filter((member) => member.id !== userId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      // Only include fields that have been modified
      const payload = {
        name: groupName.trim(),
      };
      // Only include amount if it's been modified
      if (amount !== "") {
        payload.amount = Number(amount);
      }
      // Only include members if they've been modified
      if (userIdInput.trim() || selectedMembers.length > 0) {
        payload.memberIds = selectedMembers.map((member) => member.id);
      }
      await customFetch.patch(`/groups/${groupId}`, payload);
      setShowSuccess(true);
      toast.success("Group updated successfully!");
      setTimeout(() => {
        navigate(`/dashboard/view-groups/${groupId}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating group:", error);
      const errorMessage =
        error.response?.data?.msg ||
        "Failed to update group. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Form is valid if at least the name is provided and valid
  const isFormValid = groupName.trim();

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
              <h1 className="text-lg font-semibold text-gray-900">
                Update Group
              </h1>
              <p className="text-xs text-gray-500">Modify group details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
          {/* Header Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Update Group
            </h2>
            <p className="text-sm text-gray-600">
              Modify group details (only name required)
            </p>
          </div>

          {/* Success State */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-xl flex items-center justify-center z-10">
              <div className="text-center p-4">
                <div className="text-6xl mb-4 animate-bounce">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Group Updated Successfully!
                </h3>
                <p className="text-gray-600">Redirecting to group details...</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (errors.groupName) {
                    setErrors({ ...errors, groupName: "" });
                  }
                }}
                placeholder="Enter group name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-gray-900 ${
                  errors.groupName
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.groupName && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.groupName}
                </p>
              )}
            </div>

            {/* Amount Field (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount <span className="text-blue-500">(optional)</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors({ ...errors, amount: "" });
                  }
                }}
                placeholder="Leave empty to keep current amount"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-gray-900 ${
                  errors.amount
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Members Selection (Optional) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Group Members{" "}
                  <span className="text-blue-500">(optional)</span>
                </label>
                <span className="text-sm text-blue-600">
                  {selectedMembers.length} members selected
                </span>
              </div>

              {/* Selected Members List */}
              {selectedMembers.length > 0 && (
                <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Current Members:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200"
                      >
                        <span className="truncate max-w-24">{member.id}</span>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User ID Input */}
              <div className="relative">
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMember(userIdInput);
                    }
                  }}
                  placeholder="Enter user ID to add..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-gray-900 ${
                    errors.members
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.members && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.members}
                </p>
              )}
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                isFormValid && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Group...</span>
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Update Group</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mt-4 max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Update Guidelines
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Only group name is required to update</li>
                <li>• Leave amount empty to keep current value</li>
                <li>• Add new members or remove existing ones</li>
                <li>• Changes will be reflected immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateGroup;
