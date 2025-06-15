// require("dotenv").config({ path: "./.env/.env" });
// const cluster = require("cluster");
// const cpus = require("node:os");

require('dotenv').config();
const http = require('http');
const express = require('express');
const port = process.env.PORT || 3000;

const { Server } = require("socket.io");
const path = require("path");
const compression = require("compression");

const logUser = require('./app_components/routers/users');
const auth = require('./app_components/routers/controllers/auth');
const error_handler = require('./app_components/routers/controllers/error_logger');
const home = require('./app_components/routers/home');
const IO = require('./app_components/socket/io');
const io_auth = require('./app_components/socket/io_auth');
const images = require('./app_components/routers/profile_image');
const feedback = require('./app_components/routers/user_fdback');
const tour = require('./app_components/routers/tour');
const account_setting = require('./app_components/routers/account_setting');
const client_site_error_logger = require("./app_components/routers/client_site_error_logger");
const subscription = require("./app_components/routers/subscription");

const app = express();

const server = http.createServer(app, {
  cors: {
    origin: "http://localhost:3000",
    Credential: true,
  },
});

// Socket.IO
const io = new Server(server, {
  maxHttpBufferSize: 10 * 1024 * 1024, // 10MB
  cors: { origin: "http://localhost:3000", Credential: true, methods: ["GET", "POST"] },
});

// Socket Middleware
io.use(io_auth);
IO(io);

// middlewares
app.use(
  compression({ level: 6, threshold: 10 * 1000, filter: (req, res) => { 
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/", express.static(__dirname + "/public"));

app.use("/leaflet.markercluster", express.static(__dirname + "/public/plugins/leaflet.markercluster")
);
app.use("/leaflet-routing-machine", express.static(__dirname + "/public/plugins/leaflet-routing-machine")
);

// Serve only image files securely
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// set views
app.set("views", "./views");

app.set("view engine", "ejs");

app.use(auth);

//  APIs
app.use("/logs", logUser);

app.use("/image", images);

app.use("/account_setting", account_setting);

//  Notification
app.use("/subscribe", subscription);

app.use("/feedback", feedback);

app.use("/tour", tour);

app.use("/", home);

app.use("/client_site_error_logger", client_site_error_logger);

app.use(error_handler);

server.listen(port, () => {
  console.log('Server is running on port 3000');
});