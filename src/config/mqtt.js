const mqtt = require("mqtt");
const websocket = require("./websocket");

module.exports = () => {
  console.log("[MQTT] Initializing...");
  const client = mqtt.connect(process.env.MQTT_HOST);

  client.on("connect", () => {
    console.log("✅ [MQTT] Connected to broker");
    client.subscribe(process.env.MQTT_TOPIC, (err) => {
      if (err) console.error("❌ [MQTT] Subscribe error:", err);
      else console.log(`✅ [MQTT] Subscribed to: ${process.env.MQTT_TOPIC}`);
    });
  });

  client.on("message", async (topic, message) => {
    try {
      // 1. Parsing Data Mentah dari ESP32
      const data = JSON.parse(message.toString());

      // 2. Ambil isi 'payload' (cegah crash jika kosong)
      const isiData = data.payload || {};

      // 3. Format data agar Frontend mudah membacanya
      // UPDATE: Menambahkan field odor_score, odor_status, dan odor_level
      const sensorData = {
        type: "sensor_data",
        deviceId: data.device_id || "unknown",
        payload: {
          temperature: isiData.temperature || 0,
          humidity: isiData.humidity || 0,
          heat_index: isiData.heat_index || 0,
          co2: isiData.co2 || 0,

          // --- DATA BARU ---
          odor_score: isiData.odor_score || 0,
          odor_status: isiData.odor_status || "UNKNOWN",
          odor_level: isiData.odor_level || "No Data",
        },
        timestamp: Date.now(),
      };

      // 4. Broadcast ke Frontend via WebSocket
      websocket.broadcast(JSON.stringify(sensorData));

      // 5. SUMMARY LOG (Updated untuk debugging Odor)
      console.log(
        `📡 [DATA] Device: ${sensorData.deviceId} | ` +
          `Temp: ${sensorData.payload.temperature}°C | ` +
          `Score: ${sensorData.payload.odor_score} (${sensorData.payload.odor_status}) | ` +
          `Clients: ${
            websocket.getConnectionsCount
              ? websocket.getConnectionsCount()
              : "?"
          }`
      );
    } catch (err) {
      console.error("❌ [MQTT] Error processing message:", err.message);
    }
  });

  client.on("error", (err) => console.error("❌ [MQTT] Error:", err.message));

  return client;
};
