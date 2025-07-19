"use client";

import { useState, useEffect } from "react";
import customFetch from "../utils/customFetch";

const EditProfile = ({ initialData, onClose, onUpdate, darkMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
  });

  // Original data for comparison
  const [originalData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
  });

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return true; // Empty email is valid since it's optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Empty phone is valid since it's optional
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateForm = () => {
    const newErrors = {};
    const hasChanges = Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );

    if (!hasChanges) {
      setErrors({ submit: "No changes made to update" });
      return false;
    }

    // Only validate fields that have values
    if (formData.name && formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Only include fields that have changed
    const updatedFields = {};
    if (formData.name !== originalData.name)
      updatedFields.name = formData.name;
    if (formData.email !== originalData.email)
      updatedFields.email = formData.email;
    if (formData.phone !== originalData.phone)
      updatedFields.phone = formData.phone;

    setIsLoading(true);

    try {
      const response = await customFetch.patch(
        "/auth/update-user",
        updatedFields
      );

      if (response.data) {
        setShowSuccess(true);

        // Call the onUpdate prop after successful update
        setTimeout(() => {
          onUpdate(response.data.user);
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.msg || "Failed to update profile";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
    onClose();
  };

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "dark bg-gray-900"
          : "bg-gradient-to-br from-slate-50 to-blue-50"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-white backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-800"
              >
                <span className="text-xl">←</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg transition-all hover:scale-110 bg-gray-100 text-gray-600"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Avatar Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl mx-auto mb-4">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
              <span className="text-sm">📷</span>
            </button>
          </div>
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            } mb-2`}
          >
            Update Your Profile
          </h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Keep your information up to date
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`relative ${
            darkMode ? "bg-gray-800/50" : "bg-white/70"
          } backdrop-blur-xl rounded-2xl shadow-xl border ${
            darkMode ? "border-gray-700" : "border-white/30"
          } p-8`}
        >
          {/* Success Overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">✅</div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Profile Updated!
                </h3>
                <p
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Your changes have been saved successfully
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 ${
                    darkMode ? "bg-gray-700/50" : "bg-white/50"
                  } backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500 text-lg ${
                    errors.name
                      ? "border-red-400 focus:ring-red-500"
                      : "border-white/30 dark:border-gray-600"
                  }`}
                  placeholder="Enter your full name"
                />
                <span className="absolute left-4 top-4 text-gray-400 text-xl">
                  👤
                </span>
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 ${
                    darkMode ? "bg-gray-700/50" : "bg-white/50"
                  } backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500 text-lg ${
                    errors.email
                      ? "border-red-400 focus:ring-red-500"
                      : "border-white/30 dark:border-gray-600"
                  }`}
                  placeholder="Enter your email address"
                />
                <span className="absolute left-4 top-4 text-gray-400 text-xl">
                  📧
                </span>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className={`block text-sm font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 ${
                    darkMode ? "bg-gray-700/50" : "bg-white/50"
                  } backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500 text-lg ${
                    errors.phone
                      ? "border-red-400 focus:ring-red-500"
                      : "border-white/30 dark:border-gray-600"
                  }`}
                  placeholder="Enter your phone number"
                />
                <span className="absolute left-4 top-4 text-gray-400 text-xl">
                  📱
                </span>
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={!hasChanges || isLoading}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                  hasChanges && !isLoading
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                } hover:scale-105 shadow-md`}
              >
                <span>↩️</span>
                <span>Cancel</span>
              </button>
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="text-center pt-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center space-x-1">
                  <span>●</span>
                  <span>You have unsaved changes</span>
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Additional Info Card */}
        <div
          className={`mt-6 ${
            darkMode ? "bg-gray-800/30" : "bg-blue-50/50"
          } backdrop-blur-xl rounded-2xl border ${
            darkMode ? "border-gray-700" : "border-blue-200"
          } p-6`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3
                className={`font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                } mb-2`}
              >
                Profile Tips
              </h3>
              <ul
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } space-y-1`}
              >
                <li>• Use your real name for better group recognition</li>
                <li>• Keep your email updated for important notifications</li>
                <li>• Your phone number helps with UPI payment verification</li>
                <li>• Profile changes are reflected across all your groups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
