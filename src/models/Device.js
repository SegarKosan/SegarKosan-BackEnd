const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["temperature", "humidity", "power", "voltage", "custom"],
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// HAPUS duplicate index definitions di bawah ini
// deviceSchema.index({ deviceId: 1 });
// deviceSchema.index({ type: 1 });
// deviceSchema.index({ status: 1 });

deviceSchema.methods.toJSON = function () {
  const device = this.toObject();
  device.id = device._id;
  delete device._id;
  delete device.__v;
  return device;
};

module.exports = mongoose.model("Device", deviceSchema);
