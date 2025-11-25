const mongoose = require("mongoose");

const sensorLogSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true, // Untuk query yang lebih cepat
    },
    payload: {
      type: mongoose.Schema.Types.Mixed, // Bisa menampung berbagai tipe data JSON
      required: true,
    },
    // Tambahan field untuk metadata yang berguna
    sensorType: {
      type: String,
      enum: [
        "temperature",
        "humidity",
        "pressure",
        "voltage",
        "current",
        "custom",
      ],
      default: "custom",
    },
    value: {
      type: Number,
      required: false, // Optional, untuk memudahkan query numerik
    },
    unit: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

// Index untuk query yang lebih efisien
sensorLogSchema.index({ deviceId: 1, createdAt: -1 });
sensorLogSchema.index({ createdAt: -1 });
sensorLogSchema.index({ sensorType: 1 });

// Static method untuk mencari logs berdasarkan deviceId
sensorLogSchema.statics.findByDeviceId = function (deviceId, limit = 100) {
  return this.find({ deviceId }).sort({ createdAt: -1 }).limit(limit).exec();
};

// Static method untuk stats
sensorLogSchema.statics.getDeviceStats = function (deviceId) {
  return this.aggregate([
    { $match: { deviceId } },
    {
      $group: {
        _id: "$deviceId",
        totalLogs: { $sum: 1 },
        firstLog: { $min: "$createdAt" },
        lastLog: { $max: "$createdAt" },
      },
    },
  ]);
};

// Instance method untuk format response
sensorLogSchema.methods.toJSON = function () {
  const sensorLog = this.toObject();
  sensorLog.id = sensorLog._id;
  delete sensorLog._id;
  delete sensorLog.__v;
  return sensorLog;
};

module.exports = mongoose.model("SensorLog", sensorLogSchema);
