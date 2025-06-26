import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import useFetch from "../utils/customFetch";
import { toast } from "react-toastify";
import { TypewriterEffectDemo } from "../Components/CustomComponents";
import Bg from "../assets/BG.jpg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const AutoFillEmail = formData.email.includes("@")
      ? formData.email
      : `${formData.email}@gmail.com`;

    try {
      const response = await useFetch.post("/auth/login", {
        ...formData,
        email: AutoFillEmail,
      });

      toast.success(response.data.msg || "Login successful!");
      navigate("/jwells");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error?.response?.data?.msg || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Background Image with Blur */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 10,
            ease: "easeOut",
            repeat: Infinity, // Make it repeat infinitely
            repeatType: "reverse", // Reverse the animation direction
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url(${Bg})`,
              filter: "blur(8px)",
            }}
          ></div>
          {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full space-y-8 bg-base-100 p-8 rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto h-12 w-12 relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full"></div>
              <LogIn className="w-8 h-8 absolute inset-0 m-auto text-primary" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-extrabold font-playfair">
              <TypewriterEffectDemo
                words={[
                  { text: "Welcome", className: "text-grey-100" },
                  { text: "Back", className: "text-grey-100" },
                  { text: "to", className: "text-grey-100" },
                  { text: "Infinity", className: "text-golden" },
                ]}
              />
            </h2>
            <p className="mt-2 text-sm text-base-content/60">
              Sign in to access your jewelry collection
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-primary" />
                    ) : (
                      <Eye className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-sm text-base-content"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary-focus"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary w-full flex justify-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary-focus font-medium"
              >
                Create one now
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
