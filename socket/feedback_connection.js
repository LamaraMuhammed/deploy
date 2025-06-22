const { schema } = require("../models/model");
const { inversion } = require("../utils/inversion");

module.exports = async function (socket, send) {
  const conn_id = socket.id;
  const { phone_number, username } = socket.user;

  try {
    const fdb = await schema.UserFeedBack.find({ comment_id: process.env.DEF_ID }).limit(
      100
    );

    if (fdb) {
      fdb.forEach((cmt) => {
        cmt.comments.view = cmt.viewed;
        send(conn_id, "feedback", cmt.comments);
      });
    }

    socket.on("myFeed", async (msg) => {
      const content = {
        imgUrl: inversion.encrypt(phone_number),
        username: username,
        eventDt: msg.time,
        comment: msg.comment,
      };
  
      await schema.UserFeedBack.create({ comments: content });

      send(conn_id, "feedback", content);

      socket.broadcast.emit("feedback", content);
    });

  } catch (error) {
    console.log(error)
    return;
  }
};
