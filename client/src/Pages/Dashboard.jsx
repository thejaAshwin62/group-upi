"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { motion, AnimatePresence } from "framer-motion";
import { handleLogout } from "../utils/logoutUtils";

const DeleteModal = ({ isOpen, onClose, onConfirm, groupName }) => {
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
            className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-md w-full shadow-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600 dark:text-red-500"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete Group
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{groupName}</span>? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-lg shadow-red-500/25"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    groupId: null,
    groupName: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredGroups, setFilteredGroups] = useState([]);

  const fetchUserData = async () => {
    try {
      const response = await customFetch.get("/auth/current-user");
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // console.log("userData", userData);

  if (!userData) {
    navigate("/login");
  }

  const handleSort = (groups) => {
    if (!groups) return [];
    return [...groups].sort((a, b) => {
      let compareValue;
      switch (sortBy) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "members":
          compareValue = (a.membersCount || 0) - (b.membersCount || 0);
          break;
        case "amount":
          compareValue = (a.totalAmount || 0) - (b.totalAmount || 0);
          break;
        case "date":
          compareValue = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          compareValue = 0;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });
  };

  useEffect(() => {
    if (userData?.groups?.owned) {
      let filtered = userData.groups.owned;
      if (searchQuery) {
        filtered = filtered.filter((group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      filtered = handleSort(filtered);
      setFilteredGroups(filtered);
    }
  }, [userData, searchQuery, sortBy, sortOrder]);

  const sidebarItems = [
    { name: "Dashboard", icon: "📊", active: true },
    {
      name: "Create Group",
      icon: "➕",
      active: false,
      link: "/dashboard/create-group",
    },
  ];

  const handleEditGroup = (groupId, e) => {
    e.preventDefault();
    navigate(`/dashboard/update-group/${groupId}`);
  };

  const handleDeleteGroup = async (groupId, groupName, e) => {
    e.preventDefault();
    setDeleteModal({ isOpen: true, groupId, groupName });
  };

  const confirmDelete = async () => {
    try {
      await customFetch.delete(`/groups/${deleteModal.groupId}`);
      setUserData((prevData) => ({
        ...prevData,
        groups: {
          ...prevData.groups,
          owned: prevData.groups.owned.filter(
            (group) => group._id !== deleteModal.groupId
          ),
        },
      }));
      toast.success("Group deleted successfully");
      setDeleteModal({ isOpen: false, groupId: null, groupName: "" });
      fetchUserData();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error.response?.data?.msg || "Failed to delete group");
      setDeleteModal({ isOpen: false, groupId: null, groupName: "" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg border-r ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } w-64 lg:w-72`}
        >
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">UP</span>
                </div>
                <div>
                  <h1
                    className={`font-bold text-lg ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    UPI Groups
                  </h1>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Payment Manager
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.link || "#"}
                onClick={() => setSidebarOpen(false)}
              >
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    item.active
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                      : `${
                          darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {userData?.user?.name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium truncate ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {userData?.user?.name}
                </p>
                <p
                  className={`text-xs truncate ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {userData?.user?.email}
                </p>
              </div>
              <Link to="/dashboard/profile">
                <button
                  className={`p-2 rounded-lg ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={darkMode ? "text-gray-400" : "text-gray-500"}
                  >
                    <path d="M9 18l6-6-6-6"></path>
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 lg:ml-72">
          {/* Top Bar */}
          <header
            className={`sticky top-0 z-30 ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-sm border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="px-4 py-3">
              {/* Mobile Layout */}
              <div className="flex flex-col space-y-3 lg:hidden">
                {/* Top Row - Menu & User */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`p-2 rounded-lg transition-all ${
                        darkMode
                          ? "bg-gray-700 text-yellow-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {darkMode ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="5"></circle>
                          <line x1="12" y1="1" x2="12" y2="3"></line>
                          <line x1="12" y1="21" x2="12" y2="23"></line>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                          <line
                            x1="18.36"
                            y1="18.36"
                            x2="19.78"
                            y2="19.78"
                          ></line>
                          <line x1="1" y1="12" x2="3" y2="12"></line>
                          <line x1="21" y1="12" x2="23" y2="12"></line>
                          <line
                            x1="4.22"
                            y1="19.78"
                            x2="5.64"
                            y2="18.36"
                          ></line>
                          <line
                            x1="18.36"
                            y1="5.64"
                            x2="19.78"
                            y2="4.22"
                          ></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {userData?.user?.name?.charAt(0)}
                          </span>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }
                        >
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </button>

                      {showUserDropdown && (
                        <div
                          className={`absolute right-0 top-12 w-48 ${
                            darkMode ? "bg-gray-800" : "bg-white"
                          } rounded-lg shadow-xl border ${
                            darkMode ? "border-gray-700" : "border-gray-200"
                          } py-1 z-50`}
                        >
                          <Link to="/dashboard/profile">
                            <button
                              className={`w-full text-left px-4 py-2 text-sm ${
                                darkMode
                                  ? "text-gray-300 hover:bg-gray-700"
                                  : "text-gray-700 hover:bg-gray-100"
                              } flex items-center space-x-2`}
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              <span>Profile</span>
                            </button>
                          </Link>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm ${
                              darkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-gray-100"
                            } flex items-center space-x-2`}
                            onClick={() => handleLogout(navigate)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Bar - Full Width */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`absolute left-3 top-3 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`flex-1 px-3 py-2.5 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-800"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm`}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="members">Sort by Members</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="date">Sort by Date</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className={`p-2.5 rounded-lg ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-white hover:bg-gray-50"
                    } border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    } transition-all`}
                    title={
                      sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`${
                        darkMode ? "text-white" : "text-gray-600"
                      } ${
                        sortOrder === "desc" ? "rotate-180" : ""
                      } transition-transform`}
                    >
                      <path d="M3 6h18l-9 12-9-12z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`absolute left-3 top-2.5 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-200 text-gray-800"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    >
                      <option value="name">Name</option>
                      <option value="members">Members</option>
                      <option value="amount">Amount</option>
                      <option value="date">Date Created</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className={`p-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-white hover:bg-gray-50"
                      } border ${
                        darkMode ? "border-gray-600" : "border-gray-200"
                      } transition-all`}
                      title={
                        sortOrder === "asc"
                          ? "Sort Descending"
                          : "Sort Ascending"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`${
                          darkMode ? "text-white" : "text-gray-600"
                        } ${
                          sortOrder === "desc" ? "rotate-180" : ""
                        } transition-transform`}
                      >
                        <path d="M3 6h18l-9 12-9-12z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode
                        ? "bg-gray-700 text-yellow-400"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {darkMode ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line
                          x1="18.36"
                          y1="18.36"
                          x2="19.78"
                          y2="19.78"
                        ></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {userData?.user?.name?.charAt(0)}
                        </span>
                      </div>
                      <span
                        className={`font-medium text-sm ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {userData?.user?.name?.split(" ")[0]}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={darkMode ? "text-gray-400" : "text-gray-500"}
                      >
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </button>

                    {showUserDropdown && (
                      <div
                        className={`absolute right-0 top-12 w-48 ${
                          darkMode ? "bg-gray-800" : "bg-white"
                        } rounded-lg shadow-xl border ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        } py-1 z-50`}
                      >
                        <Link to="/dashboard/profile">
                          <button
                            className={`w-full text-left px-4 py-2 text-sm ${
                              darkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-gray-100"
                            } flex items-center space-x-2`}
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Profile</span>
                          </button>
                        </Link>
                        <button
                          className={`w-full text-left px-4 py-2 text-sm ${
                            darkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          } flex items-center space-x-2`}
                          onClick={() => handleLogout(navigate)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-4 sm:p-6">
            {/* User Info */}
            <div className="mb-6">
              <h1
                className={`text-2xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Welcome, {userData?.user?.name}
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {userData?.user?.email} • Member since{" "}
                {new Date(userData?.user?.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Groups Grid */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Your Owned Groups ({filteredGroups.length})
                </h2>
                <Link to="/dashboard/create-group">
                  <button className="flex items-center justify-center space-x-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>New Group</span>
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGroups.map((group) => (
                  <div
                    key={group._id}
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-xl p-5 border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } shadow-sm hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-lg mb-1 truncate ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {group.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {group.membersCount || 0} members
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p
                          className={`font-bold text-xl ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          ₹{(group.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/dashboard/view-groups/${group._id}`}
                        className="w-full"
                      >
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span>View Group</span>
                        </button>
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleEditGroup(group._id, e)}
                          className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center text-sm"
                          aria-label="Edit group"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          <span className="ml-1 hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteGroup(group._id, group.name, e)
                          }
                          className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center text-sm"
                          aria-label="Delete group"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          <span className="ml-1 hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State for Owned Groups */}
              {filteredGroups.length === 0 && (
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-xl p-6 border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } shadow-sm text-center`}
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    {searchQuery ? (
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-8 h-8 text-blue-500"
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
                    )}
                  </div>
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {searchQuery
                      ? "No matching groups found"
                      : "No groups created yet"}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {searchQuery
                      ? `No groups match your search "${searchQuery}"`
                      : "Create your first group to start managing expenses"}
                  </p>
                  <Link to="/dashboard/create-group">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm">
                      Create New Group
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Joined Groups */}
            <div className="mb-8">
              <h2
                className={`text-xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Groups You've Joined ({userData?.groups?.joined?.length || 0})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userData?.groups?.joined?.map((group) => (
                  <div
                    key={group._id}
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-xl p-5 border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } shadow-sm hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-lg mb-1 truncate ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {group.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Created by {group.owner} • {group.membersCount || 0}{" "}
                          members
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p
                          className={`font-bold text-xl ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          ₹{(group.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Link to={`/dashboard/view-groups/${group._id}`}>
                      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center space-x-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>View Group</span>
                      </button>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Empty State for Joined Groups */}
              {userData?.groups?.joined?.length === 0 && (
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-xl p-6 border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } shadow-sm text-center`}
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    No joined groups
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    You haven't been added to any groups yet
                  </p>
                </div>
              )}
            </div>

            {/* Empty State */}
            {!userData?.groups?.owned?.length &&
              !userData?.groups?.joined?.length && (
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-xl p-8 border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } shadow-sm text-center my-8`}
                >
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    No groups found
                  </h3>
                  <p
                    className={`text-sm mb-6 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Create a new group or join existing ones to get started
                  </p>
                  <Link to="/dashboard/create-group">
                    <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                      Create Your First Group
                    </button>
                  </Link>
                </div>
              )}
          </main>
        </div>

        {/* Create Group Button (Mobile) */}
        <Link to="/dashboard/create-group">
          <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl z-40 lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </Link>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, groupId: null, groupName: "" })
        }
        onConfirm={confirmDelete}
        groupName={deleteModal.groupName}
      />
    </>
  );
};

export default Dashboard;
