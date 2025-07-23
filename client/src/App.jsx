import React from "react";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./Pages/Home";
import LoginPage from "./Pages/loginPage";
import RegisterPage from "./Pages/RegisterPage";
import Dashboard from "./Pages/Dashboard";
import CreateGroup from "./Pages/CreateGroup";
import ViewGroup from "./Pages/ViewGroup";
import UpdateGroup from "./Pages/UpdateGroup";
import ProfileSetting from "./Pages/ProfileSetting";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password/:token",
      element: <ResetPassword />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/dashboard/view-groups/:groupId",
      element: <ViewGroup />,
    },
    {
      path: "/dashboard/create-group",
      element: <CreateGroup />,
    },
    {
      path: "/dashboard/update-group/:groupId",
      element: <UpdateGroup />,
    },
    {
      path: "/dashboard/profile",
      element: <ProfileSetting />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
