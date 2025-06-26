import React from "react";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./Pages/Home";
import LoginPage from "./Pages/loginPage";
import RegisterPage from "./Pages/RegisterPage";
import Dashboard from "./Pages/Dashboard";
import CreateGroup from "./Pages/CreateGroup";
const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
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
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/dashboard/create-group",
      element: <CreateGroup />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
