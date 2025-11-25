const WebSocket = require("ws");
const jwt = require("jsonwebtoken"); // Import JWT
require("dotenv").config();

let wss = null;

module.exports = {
  init(server) {
    wss = new WebSocket.Server({ server });

    console.log("🚀 [WS] WebSocket Server Ready");

    wss.on("connection", (ws, req) => {
      // --- LOGIKA AUTENTIKASI ---

      // 1. Parsing URL untuk mengambil query param 'token'
      // Format URL biasanya: ws://host:port/?token=eyJ...
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      // 2. Fungsi Helper untuk menolak koneksi
      const rejectConnection = (message) => {
        console.log(`⛔ [WS] Connection rejected: ${message}`);
        ws.close(1008, message); // 1008: Policy Violation
      };

      if (!token) {
        return rejectConnection("No token provided");
      }

      // 3. Verifikasi Token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Simpan data user ke object 'ws' untuk identifikasi session
        ws.user = decoded;

        console.log(
          `🟢 [WS] Client connected: ${
            decoded.email || decoded.id || "User"
          } (${req.socket.remoteAddress})`
        );
      } catch (error) {
        // Token expired atau invalid signature
        return rejectConnection("Invalid or expired token");
      }

      // --- KONEKSI BERHASIL ---

      console.log(`👥 [WS] Total active clients: ${wss.clients.size}`);

      ws.on("close", () => {
        console.log(`🔴 [WS] Client disconnected`);
        // console.log(`👥 [WS] Remaining clients: ${wss.clients.size}`);
      });

      ws.on("error", (error) => {
        console.error(`⚠️ [WS] Client connection error: ${error.message}`);
      });
    });
  },

  /**
   * Mengirim data ke SEMUA client yang terhubung dan terautentikasi
   */
  broadcast(data) {
    if (!wss) {
      console.error("❌ [WS] WebSocket not initialized!");
      return;
    }

    // Pastikan data dikirim dalam bentuk string JSON
    const message = typeof data === "object" ? JSON.stringify(data) : data;

    let sentCount = 0;
    wss.clients.forEach((client) => {
      // Security Check: Hanya kirim ke client yang statusnya OPEN DAN sudah punya user (Auth berhasil)
      if (client.readyState === WebSocket.OPEN && client.user) {
        client.send(message);
        sentCount++;
      }
    });

    // Optional: Debugging jika ingin melihat traffic broadcast
    // console.log(`📢 [WS] Broadcasted to ${sentCount} clients`);
  },

  getConnectionsCount() {
    return wss ? wss.clients.size : 0;
  },
};
