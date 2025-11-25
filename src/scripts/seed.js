const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Models
const User = require("../models/User");
const Device = require("../models/Device");
const SensorLog = require("../models/SensorLog");

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if DB_URI exists
    const dbUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/segarkosan";

    if (!dbUri) {
      throw new Error("DB_URI is not defined in environment variables");
    }

    console.log("📡 Connecting to database:", dbUri);

    // Connect to database - tanpa options yang deprecated
    await mongoose.connect(dbUri);
    console.log("✅ Connected to database");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Device.deleteMany({});
    await SensorLog.deleteMany({});
    console.log("✅ Existing data cleared");

    // Seed Users
    console.log("👥 Seeding users...");
    const users = [
      {
        name: "Admin User",
        email: "admin@segarkosan.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "user",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users created`);

    // Seed Devices
    console.log("📱 Seeding devices...");
    const devices = [
      {
        deviceId: "sensor_001",
        name: "Temperature Sensor 1",
        type: "temperature",
        location: "Living Room",
        status: "active",
        createdBy: createdUsers[0]._id,
      },
      {
        deviceId: "sensor_002",
        name: "Humidity Sensor 1",
        type: "humidity",
        location: "Bedroom",
        status: "active",
        createdBy: createdUsers[0]._id,
      },
      {
        deviceId: "sensor_003",
        name: "Power Monitor 1",
        type: "custom",
        location: "Kitchen",
        status: "inactive",
        createdBy: createdUsers[1]._id,
      },
      {
        deviceId: "sensor_004",
        name: "Water Flow Sensor",
        type: "custom",
        location: "Bathroom",
        status: "active",
        createdBy: createdUsers[0]._id,
      },
    ];

    const createdDevices = await Device.insertMany(devices);
    console.log(`✅ ${createdDevices.length} devices created`);

    // Seed Sensor Logs
    console.log("📊 Seeding sensor logs...");
    const sensorLogs = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const device = createdDevices[i % createdDevices.length];
      const timestamp = new Date(now - i * 60000); // 1 minute intervals

      let value, unit, payload;

      if (device.type === "temperature") {
        value = (Math.random() * 10 + 20).toFixed(1); // 20-30°C
        unit = "celsius";
        payload = {
          temperature: parseFloat(value),
          unit: unit,
          status: "normal",
        };
      } else if (device.type === "humidity") {
        value = (Math.random() * 30 + 40).toFixed(1); // 40-70%
        unit = "percent";
        payload = {
          humidity: parseFloat(value),
          unit: unit,
          status: "normal",
        };
      } else if (device.type === "power") {
        value = (Math.random() * 100 + 500).toFixed(1); // 500-600W
        unit = "watt";
        payload = {
          power: parseFloat(value),
          unit: unit,
          voltage: 220,
        };
      } else {
        value = (Math.random() * 10).toFixed(1); // 0-10 L/min
        unit = "L/min";
        payload = {
          flow_rate: parseFloat(value),
          unit: unit,
          total_flow: (Math.random() * 1000).toFixed(1),
        };
      }

      sensorLogs.push({
        deviceId: device.deviceId,
        payload: payload,
        sensorType: device.type,
        value: parseFloat(value),
        unit: unit,
        timestamp: timestamp,
      });
    }

    await SensorLog.insertMany(sensorLogs);
    console.log(`✅ ${sensorLogs.length} sensor logs created`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Seeded Data Summary:");
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   📱 Devices: ${createdDevices.length}`);
    console.log(`   📊 Sensor Logs: ${sensorLogs.length}`);
    console.log("\n🔑 Default Login Credentials:");
    console.log("   Admin: admin@segarkosan.com / admin123");
    console.log("   User: john@example.com / password123");
    console.log("   User: jane@example.com / password123");
    console.log("\n📍 Device IDs for testing:");
    createdDevices.forEach((device) => {
      console.log(
        `   ${device.deviceId} - ${device.name} (${device.location})`
      );
    });
  } catch (error) {
    console.error("❌ Seeding failed:");
    console.error("   Error:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check if MongoDB is running: mongod --version");
    console.log("   2. Start MongoDB service: net start MongoDB");
    console.log('   3. Or run: mongod --dbpath "C:\\data\\db"');
    console.log(
      "   4. Verify .env file has DB_URI=mongodb://localhost:27017/segarkosan"
    );
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("\n📦 Database connection closed");
    }
    process.exit(0);
  }
};

// Run seeder
seedData();
