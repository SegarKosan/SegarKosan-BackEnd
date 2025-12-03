const mongoose = require("mongoose");

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn) return cachedConn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing!");
  }

  try {
    cachedConn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "segarkosan",
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[DB] MongoDB Connected: ${cachedConn.connection.host}`);
    return cachedConn;
  } catch (error) {
    console.error(`[DB] MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
