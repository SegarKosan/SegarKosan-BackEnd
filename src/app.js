const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
// app.use("/device", require("./routes/device.routes"));

module.exports = app;
