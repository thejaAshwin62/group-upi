"use client";

import { useState, useEffect } from "react";
import { CardContainer, CardBody, CardItem } from "../ui/3d-card";
import { BackgroundGradient } from "../ui/background-gradient";
import { SparklesCore } from "../ui/sparkles";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  // Mock data for groups
  const groups = [
    {
      id: 1,
      name: "Weekend Trip to Goa",
      amount: 15000,
      members: 8,
      paid: 5,
      status: "active",
      lastActivity: "2 hours ago",
      category: "travel",
      progress: 62.5,
    },
    {
      id: 2,
      name: "Office Lunch",
      amount: 2400,
      members: 12,
      paid: 12,
      status: "completed",
      lastActivity: "1 day ago",
      category: "food",
      progress: 100,
    },
    {
      id: 3,
      name: "Birthday Party",
      amount: 8500,
      members: 15,
      paid: 8,
      status: "active",
      lastActivity: "30 minutes ago",
      category: "celebration",
      progress: 53.3,
    },
    {
      id: 4,
      name: "Movie Night",
      amount: 1200,
      members: 6,
      paid: 3,
      status: "active",
      lastActivity: "5 hours ago",
      category: "entertainment",
      progress: 50,
    },
  ];

  const stats = {
    totalGroups: groups.length,
    activeGroups: groups.filter((g) => g.status === "active").length,
    totalAmount: groups.reduce((sum, g) => sum + g.amount, 0),
    completedPayments: groups.reduce((sum, g) => sum + g.paid, 0),
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || group.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <SparklesCore
        id="dashboard-sparkles"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={20}
        className="w-full h-full"
        particleColor="#3B82F6"
      />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-4">
              Payment Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your groups, track payments, and stay organized with our
              advanced dashboard
            </p>
          </div>
        </motion.div>

        {/* Bento Grid Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12"
        >
          {/* Large Stat Card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-2"
          >
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 h-full flex flex-col justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    ₹{(stats.totalAmount / 1000).toFixed(0)}K
                  </div>
                  <div className="text-gray-600 text-lg">Total Amount</div>
                  <div className="mt-4 w-full bg-blue-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Medium Stat Cards */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 lg:col-span-1"
          >
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col justify-center text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.totalGroups}
                </div>
                <div className="text-gray-600 text-sm">Total Groups</div>
              </div>
            </BackgroundGradient>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="md:col-span-1 lg:col-span-1"
          >
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col justify-center text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {stats.activeGroups}
                </div>
                <div className="text-gray-600 text-sm">Active</div>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-2"
          >
            <BackgroundGradient className="rounded-3xl p-1 h-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 h-full flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  📱 Scan QR
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ➕ New Group
                </motion.button>
              </div>
            </BackgroundGradient>
          </motion.div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {["all", "active", "completed"].map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedFilter === filter
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/80 text-gray-600 hover:bg-white"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Groups Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${
                  index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                } ${index === 1 ? "lg:row-span-2" : ""}`}
              >
                <CardContainer className="inter-var h-full">
                  <CardBody className="relative group/card h-full">
                    <BackgroundGradient className="rounded-3xl p-1 h-full">
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col">
                        <CardItem
                          translateZ="50"
                          className="text-xl font-bold text-gray-900 mb-2 line-clamp-2"
                        >
                          {group.name}
                        </CardItem>

                        <CardItem
                          as="p"
                          translateZ="60"
                          className="text-gray-600 text-sm mb-4 flex-1"
                        >
                          Last activity: {group.lastActivity}
                        </CardItem>

                        <CardItem translateZ="100" className="w-full">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-blue-600">
                                ₹{group.amount.toLocaleString()}
                              </span>
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  group.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {group.status}
                              </motion.span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-600">
                              <span>👥 {group.members} members</span>
                              <span>
                                ✅ {group.paid}/{group.members} paid
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${group.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                              ></motion.div>
                            </div>
                          </div>
                        </CardItem>

                        <div className="flex justify-between items-center mt-6 gap-3">
                          <CardItem
                            translateZ={20}
                            as={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                          >
                            View Details
                          </CardItem>
                          <CardItem
                            translateZ={20}
                            as={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                          >
                            Manage →
                          </CardItem>
                        </div>
                      </div>
                    </BackgroundGradient>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No groups found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search or create a new group to get started
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
            >
              Create Your First Group
            </motion.button>
          </motion.div>
        )}
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

export default Dashboard;
