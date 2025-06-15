import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongoose/database.js";
import paymentsRoutes from "./routes/paymentRoutes.js";
import groupsRoutes from "./routes/groupRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Express App Setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/groups", groupsRoutes);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.resolve(__dirname, "./public")));

// Sample Route
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./public", "index.html"));
});

// Start Server and Connect to DB
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  try {
    await connectDB();
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
});
