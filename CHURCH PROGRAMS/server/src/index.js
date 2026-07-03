require("dotenv").config();      // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));  // Logs requests to console

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running perfectly!");
});

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Start server
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err.message);
  });