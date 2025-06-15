const ss = require("socket.io-stream");
const path = require("path");
const fs = require("fs");

const { forward } = require("./forward");
const { processConnectedUser } = require("./processConnectedUser");
const { request_confirmation } = require("./processReceiverConfirmation");
const { requestConn } = require("./requestProcession");
const { processChatMessages } = require("./processChatMessages");
const { processCloseWatch } = require("./processCloseWatch");
const { processDisconnectedUser } = require("./processDisconnection");
const { schema } = require("../models/model");
const { inspect } = require("../utils/checkPoint");
const { inversion } = require("../utils/inversion");

module.exports = function (socket, send) {
  const conn_id = socket.id;
  const { id, username, phone_number } = socket.user;

  processConnectedUser([conn_id, id], phone_number, username, send);

  socket.on("update", async (msg) => {
    try {
      const pref = await schema.UserPreference.findOne({
        phone_number: phone_number,
      });

      if (!pref) {
        send(conn_id, "$updates", { noData: true });
        return;
      }

      // when new record
      if (msg.trip) {
        send(conn_id, "$updates", {
          trip: pref.trip_bank.coords.length > 0 ? pref.trip_bank : null,
        });
        return;
      }

      // when log or refresh
      if (msg.update) {
        send(conn_id, "$updates", {
          trip: pref.trip_bank.coords.length > 0 ? pref.trip_bank : null,
          clw:
            pref.close_watch.watchers.size > 0
              ? pref.close_watch.watchers
              : null,
        });
      }
    } catch (err) {
      send(conn_id, "warning", "Something went wrong.");
      return;
    }
  });

  //  DELETE NOTIFICATION
  socket.on("del-nt", (e) => {
    console.log(`${phone_number}: ${username} wanna delete ${e}`);
  });

  // RECORD EVERY USER CLICKS
  socket.on("clicks", (e) => {
    console.log(`${phone_number}: ${username} has clicked ${e}`);
  });

  socket.on("pwd-check", async (msg) => {
    if (msg?.pwd) {
      let pwd = await inspect.check_password(msg.pwd, phone_number);
      send(conn_id, "clw-info", {
        [msg.mode]: { status: pwd },
      });
    }
  });

  //  Listening the request msg from Client
  socket.on("requestConnection", (msg) =>
    requestConn(conn_id, phone_number, msg, send)
  );

  // sending request to client that you wanna connect him and share loc..
  socket.on("confirm-to-share", (msg) =>
    request_confirmation(conn_id, msg, send)
  );

  // ... Sending Data To Request Sender
  socket.on("local-G", (msg) => forward(msg, send));

  // ... Sending Data To Receiver
  socket.on("remote-G", (msg) => forward(msg, send));

  // ... Sending Data To Receiver
  socket.on("ps-req", (msg) => forward(msg, send));

  socket.on("addToRoute", async (msg) => {
    let new_friend = await findOne(phone_number);
    new_friend?.connectedRoutes.set(inversion.decrypt(msg.id), true);
    await new_friend?.save();
  });

  socket.on("removeListening", async (id) => {
      let listen = await findOne(phone_number);
      listen?.listening.delete(inversion.decrypt(id), true);
      await listen?.save();
  });

  // Handle image upload
  ss(socket).on("image-stream", (stream, data) => {
    try {
      const filename = `${Date.now()}-${data.name}`;
      const filepath = path.join(__dirname, "uploads", filename);
      const writeStream = fs.createWriteStream(filepath);

      stream.pipe(writeStream);

      writeStream.on("finish", () => {
        const { r_id, ...newData } = data;
        send(data.r_id, "map-$ind", {
          ...newData,
          s_id: id,
          imgUrl: `/uploads/${filename}`,
        });
      });

      writeStream.on("error", (err) =>
        send(conn_id, "warning", "BE_ERR: Something went wrong.")
      );
    } catch (err) {
      send(conn_id, "warning", "BE_ERR: Something went wrong.");
    }
  });

  // Map Interaction Using Indicators
  socket.on("mapClick", (data) => {
    if ((data.r_id && data.latlng) || data.delMarkerIndex) {
      const { r_id, ...newData } = data;
      send(data.r_id, "map-$ind", { ...newData, s_id: id });
    }
  });

  socket.on("$indWarn", (msg) => send(msg.r_id, "warning", msg.msg));

  socket.on("tripRecording", async (data) => {
    try {
      if (data.data) {
        await schema.UserPreference.findOneAndUpdate(
          { phone_number: phone_number },
          {
            trip_bank: {
              eventDate: data.eventDate,
              coords: data.data,
            },
          },
          { new: true }
        );
      }
    } catch (err) {
      send(conn_id, "warning", "BE_ERR: Something went wrong.");
    }
  });

  socket.on("deleteTrip", async () => {
    let trip = await schema.UserPreference.findOne({
      phone_number: phone_number,
    });
    (trip.trip_bank.eventDate = null),
      (trip.trip_bank.coords = trip.trip_bank.coords.filter((x) => x !== x));
    await trip.save();
  });

  socket.on("chat-send", (msg) => processChatMessages(username, id, msg, send));

  socket.on("close-watch", async (msg) =>
    processCloseWatch(conn_id, phone_number, username, msg, send)
  );

  socket.on("req_disconnection", async (dis) =>
    processDisconnectedUser(conn_id, dis, send)
  );
};


async function findOne(id) {
  if (!id) return false;
  try {
    const user = await schema.OnLineUser.findOne({ phone_number: id });
    return user;
  } catch (err) {
    return false;
  }
}

function say(...x) {console.log(x)}