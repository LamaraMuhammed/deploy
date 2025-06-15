require("dotenv").config();
const http = require("http");
const express = require("express");
const port = process.env.PORT || 3000;

const logUser = require("./app_components/routers/users");

const app = express();

const server = http.createServer(app);

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/", express.static(__dirname + "/public"));

// set views
app.set("views", "./view");

app.set("view engine", "ejs");

app.use("/logs", logUser);

server.listen(port, () => {
  console.log("Server is running on port 3000", port);
});
