import { toast } from "react-toastify";
import customFetch from "./customFetch";

export const handleLogout = async (navigate) => {
  try {
    await customFetch.get("/auth/logout");
    // Clear any local storage or state if needed
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success("Logged out successfully");
    navigate("/login");
  } catch (error) {
    console.error("Error logging out:", error);
    toast.error("Failed to logout");
  }
};
