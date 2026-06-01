const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/config");
const authRoute = require("./features/auth/auth.route");
const pointsRoute = require("./features/points/points.route");

const app = express();

const http = require('http');

morgan.token('status-msg', (req, res) => {
  return http.STATUS_CODES[res.statusCode];
});

app.use(morgan(':method :url :status :status-msg :response-time ms - :res[content-length]'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api", pointsRoute);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running in ${config.mode} mode on port ${PORT}`);
});
