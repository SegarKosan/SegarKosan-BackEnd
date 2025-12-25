# Segar Kosan - IoT Sensor Backend

A Node.js Express backend application for managing IoT sensors, real-time data streaming via MQTT, and WebSocket communication. This system monitors environmental parameters (temperature, humidity, CO2, odor levels) from smart dormitory sensor devices.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [MQTT Integration](#mqtt-integration)
- [Authentication](#authentication)
- [Project Architecture](#project-architecture)

## ✨ Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time Data Streaming**: WebSocket connection for live sensor data updates
- **MQTT Integration**: Subscribe to IoT device data via MQTT broker
- **Sensor Management**: CRUD operations for sensor devices
- **Database Logging**: MongoDB persistence for sensor readings with indexing
- **Error Handling**: Comprehensive error logging and validation
- **CORS Support**: Cross-Origin Resource Sharing enabled
- **Secure Token Verification**: JWT token validation on WebSocket connections

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 9.0.0
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Real-time**: WebSocket (ws)
- **IoT Protocol**: MQTT (mqtt 5.14.1)
- **Utilities**: dotenv, cors
- **Development**: Nodemon

## 📁 Project Structure

```
src/
├── app.js                 # Express app configuration
├── server.js              # Server entry point with service initialization
├── config/
│   ├── db.js             # MongoDB connection configuration
│   ├── mqtt.js           # MQTT broker connection & message handling
│   └── websocket.js      # WebSocket server with JWT authentication
├── controllers/
│   ├── auth.controller.js # User registration & login logic
│   ├── device.controller.js
│   └── sensor.controller.js
├── models/
│   ├── User.js           # User schema & methods
│   ├── Device.js         # Device/Sensor schema
│   └── SensorLog.js      # Sensor reading logs schema
├── routes/
│   ├── auth.routes.js    # Authentication endpoints
│   ├── device.routes.js
│   └── sensor.routes.js
├── scripts/
│   └── seed.js           # Database seeding script
└── utils/
    ├── jwt.js
    └── response.js
```

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote URI)
- MQTT Broker (e.g., Mosquitto)
- npm or yarn

### Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd be_segarkosan
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create .env file** (see [Environment Variables](#environment-variables))

4. **Seed the database** (optional but recommended)

   ```bash
   npm run seed
   ```

5. **Start the server**

   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/segarkosan

# JWT
JWT_SECRET=supersecretjwt

# MQTT Broker
MQTT_HOST=mqtt://192.168.203.94
MQTT_TOPIC=segar_kosan/sensors
```

### Variable Descriptions

| Variable     | Description                | Example                          |
| ------------ | -------------------------- | -------------------------------- |
| `PORT`       | Server port                | 5000                             |
| `MONGO_URI`  | MongoDB connection string  | mongodb://localhost:27017/dbname |
| `JWT_SECRET` | Secret key for JWT signing | your-secret-key                  |
| `MQTT_HOST`  | MQTT broker address        | mqtt://broker-address            |
| `MQTT_TOPIC` | MQTT topic to subscribe    | segar_kosan/sensors              |

## 📦 Database Setup

### MongoDB Connection

The app connects to MongoDB using the `MONGO_URI` from `.env`. If not provided, it defaults to `mongodb://127.0.0.1:27017/segarkosan`.

### Starting MongoDB

**Windows:**

```bash
net start MongoDB
# or
mongod --dbpath "C:\data\db"
```

**Linux/Mac:**

```bash
brew services start mongodb-community
# or
mongod
```

### Database Seeding

Run the seed script to populate initial data:

```bash
npm run seed
```

This creates:

- **3 Users** (1 admin, 2 regular users)
- **4 Devices** (sensors in different locations)
- **30 Sensor Logs** (sample readings)

**Default Credentials:**

- Admin: `admin@segarkosan.com` / `admin123`
- User: `john@example.com` / `password123`
- User: `jane@example.com` / `password123`

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Runs with Nodemon for auto-reload on file changes.

### Production Mode

```bash
npm start
```

### Expected Output

```
[DB] MongoDB Connected: localhost
✅ [MQTT] Connected to broker
✅ [MQTT] Subscribed to: segar_kosan/sensors
🚀 [WS] WebSocket Server Ready
[SERVER] Running on port 5000
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

## 🔌 WebSocket Events

### Connection

Connect via WebSocket with JWT token as query parameter:

```javascript
const token = "your-jwt-token-here";
const ws = new WebSocket(`ws://localhost:5000/?token=${token}`);
```

### Server-Sent Events

**Real-time Sensor Data:**

```json
{
  "type": "sensor_data",
  "deviceId": "sensor_001",
  "payload": {
    "temperature": 25.5,
    "humidity": 60,
    "heat_index": 28.2,
    "co2": 450,
    "odor_score": 120,
    "odor_status": "MEDIUM",
    "odor_level": "Moderate"
  },
  "timestamp": 1699564800000
}
```

### Connection Status

- ✅ **Connected**: Token verified, client authenticated
- ⛔ **Rejected**: No token, invalid token, or expired token
- 🔴 **Disconnected**: Client closed connection

## 📨 MQTT Integration

### Message Format

Expected message from MQTT broker:

```json
{
  "device_id": "sensor_001",
  "payload": {
    "temperature": 25.5,
    "humidity": 60,
    "heat_index": 28.2,
    "co2": 450,
    "odor_score": 120,
    "odor_status": "MEDIUM",
    "odor_level": "Moderate"
  }
}
```

### Data Flow

```
MQTT Broker → MQTT Client → Parse & Format → WebSocket Broadcast → Clients
```

The MQTT module ([`src/config/mqtt.js`](src/config/mqtt.js)) handles:

1. Connection to MQTT broker
2. Topic subscription
3. Message parsing and validation
4. Data formatting for WebSocket
5. Broadcasting to all authenticated clients

## 🔐 Authentication

### JWT Implementation

Tokens are generated upon login and must be provided for WebSocket connections.

**Token Format:**

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "userId": "...", "email": "...", "iat": ..., "exp": ... }
Secret: JWT_SECRET from .env
```

**Expiration:** 24 hours

### Password Security

Passwords are hashed using bcryptjs with salt rounds of 10. Raw passwords are never stored.

## 🏗️ Project Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│      Client (Browser/Mobile)        │
└────────────┬────────────────────────┘
             │ HTTP/WebSocket
┌────────────▼────────────────────────┐
│    Express.js REST API + WebSocket  │
│  - Routes (auth, device, sensor)    │
│  - Controllers (business logic)     │
│  - Middleware (CORS, auth)          │
└────────────┬────────────────────────┘
             │ Database queries
┌────────────▼────────────────────────┐
│  MongoDB with Mongoose Models       │
│  - User, Device, SensorLog          │
│  - Indexes for performance          │
└─────────────────────────────────────┘
```

### Data Flow (MQTT → WebSocket)

```
ESP32/IoT Device
       │
       ├─ MQTT Message
       │
MQTT Broker
       │
MQTT Client (Node.js)
       │ [mqtt.js]
       ├─ Parse message
       ├─ Format data
       │
WebSocket Server
       │ [websocket.js]
       ├─ Verify client auth
       ├─ Broadcast to all clients
       │
Connected Clients
       └─ Receive real-time data
```

## 📊 Database Models

### User Model

- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `role`: String (enum: "user", "admin", default: "user")
- `timestamps`: Created/updated at

### Device Model

- `deviceId`: String (unique, required)
- `name`: String (required)
- `type`: String (enum: temperature, humidity, power, voltage, custom)
- `location`: String (required)
- `status`: String (enum: active, inactive, maintenance)
- `createdBy`: Reference to User
- `timestamps`: Created/updated at

### SensorLog Model

- `deviceId`: String (indexed)
- `payload`: Mixed (JSON data)
- `sensorType`: String (enum of types)
- `value`: Number
- `unit`: String
- `timestamp`: Date
- `createdAt/updatedAt`: Timestamps

## 🐛 Troubleshooting

### MongoDB Connection Error

```
[DB] Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Start MongoDB service or check MONGO_URI in .env

### MQTT Connection Error

```
❌ [MQTT] Error: Connection refused
```

**Solution:** Verify MQTT_HOST is correct and broker is running

### WebSocket Authentication Failed

```
⛔ [WS] Connection rejected: Invalid or expired token
```

**Solution:** Generate new token via login endpoint and reconnect

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:** Change PORT in .env or kill process using port 5000

## 📝 Available Scripts

```bash
npm run dev          # Development with auto-reload
npm start            # Production mode
npm run seed         # Seed database with sample data
npm run fresh        # Alias for seed
npm run migrate:fresh # Alias for seed
npm run db:reset     # Alias for seed
npm run db:seed      # Alias for seed
```

## 📄 License

© 2025 SegarKosan by Morning Group. All rights reserved.