require("dotenv").config();
const http = require("http");
const express = require("express");
const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/", express.static(__dirname + "/public"));

// set views
app.set("views", "./view");

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/api", (req, res) => {
  res.status(200).json({
    name: "Ya Rasulallah",
    a: 1,
    b: 2,
    c: 3,
    d: 4,
  });
  res.end();
});

server.listen(port, () => {
  console.log("Server is running on port 3000", port);
});
