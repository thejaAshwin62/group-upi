"use client";

import { useState } from "react";
import { CardContainer, CardBody, CardItem } from "../ui/3d-card";
import { BackgroundGradient } from "../ui/background-gradient";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import { SparklesCore } from "../ui/sparkles";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
    },
    {
      id: 2,
      name: "Office Lunch",
      amount: 2400,
      members: 12,
      paid: 12,
      status: "completed",
      lastActivity: "1 day ago",
    },
    {
      id: 3,
      name: "Birthday Party",
      amount: 8500,
      members: 15,
      paid: 8,
      status: "active",
      lastActivity: "30 minutes ago",
    },
    {
      id: 4,
      name: "Movie Night",
      amount: 1200,
      members: 6,
      paid: 3,
      status: "active",
      lastActivity: "5 hours ago",
    },
  ];

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tooltipItems = [
    {
      name: "Quick Actions",
      designation: "Scan QR, Create Group, View Details",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Sparkles */}
      <SparklesCore
        id="dashboard-sparkles"
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleDensity={50}
        className="w-full h-full"
        particleColor="#FFFFFF"
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Manage your groups and track payments</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3">
            <AnimatedTooltip items={tooltipItems}>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium">
                📱 Scan QR Code
              </button>
            </AnimatedTooltip>

            <Link to={"/dashboard/create-group"}>
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium">
                ➕ Create New Group
              </button>
            </Link>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <CardContainer key={group.id} className="inter-var">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[350px] h-auto rounded-xl p-6 border">
                <BackgroundGradient className="rounded-xl p-1">
                  <div className="bg-white rounded-lg p-6">
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-neutral-600 dark:text-white mb-2"
                    >
                      {group.name}
                    </CardItem>

                    <CardItem
                      as="p"
                      translateZ="60"
                      className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                      Last activity: {group.lastActivity}
                    </CardItem>

                    <CardItem translateZ="100" className="w-full mt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-green-600">
                            ₹{group.amount.toLocaleString()}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              group.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {group.status}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                          <span>👥 {group.members} members</span>
                          <span>
                            ✅ {group.paid}/{group.members} paid
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(group.paid / group.members) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardItem>

                    <div className="flex justify-between items-center mt-6">
                      <CardItem
                        translateZ={20}
                        as="button"
                        className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        View Details
                      </CardItem>
                      <CardItem
                        translateZ={20}
                        as="button"
                        className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                      >
                        Manage →
                      </CardItem>
                    </div>
                  </div>
                </BackgroundGradient>
              </CardBody>
            </CardContainer>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No groups found
            </h3>
            <p className="text-gray-300 mb-6">
              Try adjusting your search or create a new group
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium">
              Create Your First Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
