require("dotenv").config(); // PENTING: Load .env di baris pertama
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const mqtt = require("./config/mqtt");
const websocket = require("./config/websocket");

const server = http.createServer(app);

(async () => {
  try {
    // 1. Tunggu DB connect dulu sebelum lanjut
    await connectDB();

    // 2. Inisialisasi service lain (MQTT biasanya background process, jadi aman tanpa await kecuali logic khususnya butuh blocking)
    mqtt();
    websocket.init(server);

    const port = process.env.PORT || 8080;

    // 3. Jalankan server hanya jika DB sudah aman
    server.listen(port, () => {
      console.log(`[SERVER] Running on port ${port}`);
    });
  } catch (error) {
    console.error("[SERVER] Failed to start:", error);
    process.exit(1);
  }
})();
