import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, MapPin } from "lucide-react";
import { TypewriterEffectDemo } from "../Components/CustomComponents";
import Bg from "../assets/BG.jpg";
import customFetch from "../utils/customFetch";
import { toast } from "sonner";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "Salem",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/jpg",
        ];
        if (!validTypes.includes(file.type)) {
          toast.error("Please upload a valid image file (JPEG, PNG, GIF)");
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          toast.error("Image size should be less than 2MB");
          return;
        }

        setPreviewImage(URL.createObjectURL(file));
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);

      // Send JSON instead of FormData
      const response = await customFetch.post("/auth/register", formData);

      if (response.data) {
        toast.success("Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(
        <div className="flex gap-2 items-center">
          <span>
            {error?.response?.data?.msg || "Something went wrong ..."}
          </span>
        </div>,
        {
          style: {
            backgroundColor: "#d34d58",
            color: "#fff",
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 10,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${Bg})`,
            filter: "blur(8px)",
          }}
        ></div>
      </motion.div>

      {/* Form Card */}
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
            <UserPlus className="w-8 h-8 absolute inset-0 m-auto text-primary" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold font-playfair">
            <TypewriterEffectDemo
              words={[
                { text: "Create", className: "text-golden" },
                { text: "Account", className: "text-golden" },
              ]}
            />
          </h2>
          <p className="mt-2 text-sm text-base-content/60">
            Join our exclusive infinity community
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-primary" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input input-bordered w-full pl-10"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input input-bordered w-full pl-10"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div>
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
                className="input input-bordered w-full pl-10 pr-10"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-primary" />
                ) : (
                  <Eye className="h-5 w-5 text-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium mb-2"
            >
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <input
                id="location"
                name="location"
                type="text"
                className="input input-bordered w-full pl-10"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Avatar Upload
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium mb-2">
              Profile Picture
            </label>
            <div className="space-y-2">
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="file-input file-input-bordered file-input-primary w-full"
              />
              {/* {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-full mx-auto border-2 border-primary"
                  />
                </div>
              )} */}
          {/* <p className="text-xs text-base-content/60">
                Max file size: 2MB. Supported formats: JPEG, PNG, GIF
              </p>
            </div>
          </div> */}

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="checkbox checkbox-primary"
            />
            <label htmlFor="terms" className="ml-2 block text-sm">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-primary hover:text-primary-focus"
              >
                Terms and Conditions
              </Link>
            </label>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </motion.button>

          {/* Login Link */}
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary-focus font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
