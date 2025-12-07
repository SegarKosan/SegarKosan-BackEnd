const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const allowedOrigins = ["https://segarkosan.testingfothink.my.id", undefined];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));

app.get("/test-db", async (req, res) => {
  try {
    await connectDB();
    res.json({ success: true, message: "MongoDB connected!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// app.use("/device", require("./routes/device.routes"));

module.exports = app;
