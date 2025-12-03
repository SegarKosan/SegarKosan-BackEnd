const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Pastikan fallback ke localhost jika env tidak ada
    const uri =
      process.env.MONGO_URI ||
      "mongodb+srv://khoirurizal0507_db_user:863Fy0y5hTHbNRqt@cluster0.sjf84mg.mongodb.net/segarkosan?retryWrites=true&w=majority&appName=Cluster0";

    // Hapus opsi deprecated jika pakai Mongoose v6+
    const conn = await mongoose.connect(uri);

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Error: ${error.message}`);
    process.exit(1); // Matikan proses jika DB gagal connect
  }
};

module.exports = connectDB;
