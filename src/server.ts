import express from "express";
import dotenv from "dotenv";
import app from "./app";
import { initDatabase } from "./config/db";

dotenv.config();
const PORT = process.env.PORT || 4040;

const startServer = async () => {
  console.log("starting server");
  try {
    await initDatabase();
    console.log("Database initialized successfully");
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
