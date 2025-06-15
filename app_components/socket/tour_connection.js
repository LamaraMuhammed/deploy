const { inversion } = require("../utils/inversion");

module.exports = async function (socket, send) {
  const conn_id = socket.id;
  const { phone_number, username } = socket.user;

  send(conn_id, "id", { id: phone_number, imgUrl: inversion.encrypt(phone_number) });

  socket.on("postContent", async (msg) => {
    let blobDate, content;
    try {
      //   var ctn = new postCont({
      //     userName: username,
      //     phone_number: phone_number,
      //     blob: blobDate,
      //     content: content,
      //     event: msg.event,
      //   });
      //   await ctn.save();
    } catch (err) {
      send(conn_id, "warn", "Something went wrong.");
    }
  });

  socket.on("getContent", async () => {});
};
