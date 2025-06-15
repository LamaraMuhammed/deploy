const { inversion } = require("../utils/inversion");
const { schema } = require("../models/model");
const validRespondTime = 90; // 1 min 30 secs

async function request_confirmation (myId, msg_data, callback) {
  if (!msg_data.message) { return callback(myId, "warning", "BE_ERR: Something went wrong."); };

  // s_n: sender username, s_r: sender route, s_no: sender phone number
  // r_n: receiver username, r_r: receiver route, r_no: receiver phone number
  const { mode, s_id, s_n, s_r, r_id, r_n, receiverRoute, sendTime } = msg_data.message;
  const s_no = inversion.decrypt(s_id);
  const r_no = inversion.decrypt(r_id);
  var new_s_id, new_r_id;
  
  try {
    new_s_id = await schema.OnLineUser.findOne({ phone_number: s_no });
    new_r_id = await schema.OnLineUser.findOne({ phone_number: r_no });
  } catch (err) {
    return callback(myId, "warning", "BE_ERR: Something went wrong.");
  }

  if (msg_data.res) {
    if (timeOkay(sendTime, msg_data.resTime)) {

      // FORWARD THE CONFIRMATION REQ SIDE
      callback(new_r_id.id, "remote-G", {
        s_r,
        s_c_id: new_s_id.id,
        det: {
          ids: [new_r_id.id, r_id],
          mode: mode,
          gName: r_n,
        }
      });

      // BACK TO CONFIRMING SIDE
      callback(new_s_id.id, "local-G", {
        r_c_id: new_r_id.id,
        r_r: receiverRoute,
        det: {
          ids: [new_s_id.id, s_id],
          mode: mode,
          gName: s_n,
        }
      });
    } else {
      callback(new_r_id.id, "warning", `Response timeout.`);
    }
  } else {
    callback(new_s_id.id, "warning", {id: r_id});
  }

  // REMOVE LISTENING
  new_s_id.listening.delete(r_no);
  await new_s_id.save();

  function timeOkay(sendTime, resTime) {
    let interval = new Date(resTime).getTime() - new Date(sendTime).getTime(),
      seconds = Math.floor(interval / 1000);
    if (seconds <= validRespondTime) return true;
  }
};

module.exports.request_confirmation = request_confirmation;
