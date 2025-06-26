"use client";

import { useState } from "react";
import { BackgroundGradient } from "../components/background-gradient";
import { SparklesCore } from "../components/sparkles";
import { TypewriterEffect } from "../components/typewriter-effect";
import { AnimatedTooltip } from "../components/animated-tooltip";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    upiId: "john@paytm",
  });

  const words = [
    { text: "Your" },
    { text: "Profile", className: "text-blue-500 dark:text-blue-500" },
    { text: "&" },
    { text: "Settings" },
  ];

  const tooltipItems = [
    {
      name: "Profile Tips",
      designation: "Keep your information updated for better experience",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Simulate API call
    console.log("Saving profile:", formData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Handle logout logic
      console.log("Logging out...");
      alert("Logged out successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <SparklesCore
        id="profile-sparkles"
        background="transparent"
        minSize={0.4}
        maxSize={1}
        particleDensity={30}
        className="w-full h-full"
        particleColor="#FFFFFF"
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <TypewriterEffect words={words} className="mb-4" />
            <p className="text-gray-300 text-lg">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Section */}
          <BackgroundGradient className="rounded-xl p-1 mb-8">
            <div className="bg-white rounded-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Profile Information
                </h3>
                <AnimatedTooltip items={tooltipItems}>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? "❌ Cancel" : "✏️ Edit"}
                  </button>
                </AnimatedTooltip>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-700 transition-colors">
                        📷
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary UPI ID
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) =>
                          handleInputChange("upiId", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        {formData.upiId}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </BackgroundGradient>

          {/* Security Section */}
          <BackgroundGradient className="rounded-xl p-1 mb-8">
            <div className="bg-white rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Security Settings
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    🔑 Change Password
                  </button>
                </div>

                {showChangePassword && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Update Password
                      </button>
                      <button
                        onClick={() => setShowChangePassword(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    🔒 Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </BackgroundGradient>

          {/* App Settings */}
          <BackgroundGradient className="rounded-xl p-1 mb-8">
            <div className="bg-white rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                App Settings
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Manage your notification preferences
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Dark Mode</h4>
                    <p className="text-sm text-gray-600">
                      Switch to dark theme
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </BackgroundGradient>

          {/* Danger Zone */}
          <BackgroundGradient className="rounded-xl p-1">
            <div className="bg-white rounded-lg p-8">
              <h3 className="text-2xl font-bold text-red-600 mb-6">
                Danger Zone
              </h3>

              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-red-900">Logout</h4>
                      <p className="text-sm text-red-700">
                        Sign out of your account
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-red-900">
                        Delete Account
                      </h4>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      🗑️ Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </div>
      </div>
    </div>
  );
};

export default Profile;
