const tour_connection = require("./tour_connection");
const feedback_connection = require("./feedback_connection");
const home_connection = require("./home_connection");

const { processDisconnectedUser } = require("./processDisconnection");

module.exports = function (io) {
  io.on("connection", async (socket) => {
    const { path, id } = socket.user;

    if (!id) {
      socket.disconnect();
      return;
    }

    switch (path) {
      case "/tour":
        tour_connection(socket, send)
        break;
      
      case "/feedback":
        feedback_connection(socket, send);
        break;
    
      case "/home":
        home_connection(socket, send);
        break;
    }

    socket.on("disconnect", async () =>
      processDisconnectedUser(null, socket, send)
    );

    function send(id, event, msg) {
      io.sockets.to(id).emit(event, msg);
    }
  });
};
