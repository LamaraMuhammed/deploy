const { inversion } = require('../utils/inversion');
const { schema } = require('../models/model');

const webp = require("web-push");
const vapid = require('../../config/vapid');

// WEB PUSH 
webp.setVapidDetails(
  vapid.mail,
  vapid.pub_key,
  vapid.priv_key
);

const sub = [
  {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/ch5LnUz2CtU:APA91bGB5t3LWooN6WvDpwllvh6WyIK0VIHleJzQwhBUAwQG2KdSNzMzyTCp0RrLrTiTLGo3l6boHEiAQ487lYrmyIlyin2lPJGSUdoXoXfn2h5mTizjjKsBoSDfIfwpqOT_Y0rh0xGq",
    expirationTime: null,
    keys: {
      p256dh:
        "BL7U7hOqXRFoCtf3T-dU-Q64IosIkCgWoT7VfQD8dSnPTHZSsuszx_ubEzOckyNWctvWEFKRIIgEJRcMlPhkKR0",
      auth: "aWUuOyukLUNiy1LNHsT2YA",
    },
  },
];

const requestConn = async (myId, phoneNumber, message, callback) => {
    var isReceiverRegistered, sender;
    if (message.mode  !== "CGp") {
        try{
            isReceiverRegistered = await schema.OnLineUser.findOne({ phone_number: message.value }).populate("register", "log_status").exec();
            sender = await schema.OnLineUser.findOne({ phone_number: phoneNumber });
        } catch(err) {
            callback(myId, 'warning', "Something went wrong try again.");
        }
        
        if (isReceiverRegistered && isReceiverRegistered.register) {
            if (isReceiverRegistered.online === "ON") {
                if (message.value !== phoneNumber) {
                    if (isReceiverRegistered.connectedRoutes.size < 3 && !isReceiverRegistered.listening.get(phoneNumber)) {
                        if (sender.connectedRoutes.size < 3) {
                            if (!sender.connectedRoutes.get(message.value) ) {
                                sender.listening.set(message.value, true);
                                await sender.save();
                                doRequest();

                            } else {
                                callback(myId, 'warning', `You're connected.`);
                            }

                        } else {
                            callback(myId, 'warning', "You have reached your free trial connections");
                        }

                    } else {
                        callback(myId, 'warning', "Wait please!, the other side is busy...");
                    }
    
                } else {
                    callback(myId, 'warning', "Try someone's phone number");
                }
    
            } else {
                callback(myId, 'warning', `The ${message.value} is offline`);
                // PUSH NOTIFICATION
                pushNotification(sub[0], sender, message);
            }
                
        } else {
            callback(myId, 'warning', `Unknown phone number`);
        }
    }

    function doRequest() {
        callback(isReceiverRegistered.id, 'request', {
            mode: message.mode,
            sendTime: message.time,
            s_r: sender.connectedRoutes.size,
            s_n: sender.username,
            s_id: inversion.encrypt(sender.phone_number),
            r_n: isReceiverRegistered.username,
            r_id: inversion.encrypt(isReceiverRegistered.phone_number)
        });

        callback(myId, "waitRes", { id: inversion.encrypt(isReceiverRegistered.phone_number) });
    }

    function pushNotification(subscription, sender, message) {
        const tm =
          new Date(message.time).toLocaleDateString() +
          " " +
          new Date(message.time).toLocaleTimeString();
          
        const txt =
          message.mode === "1CG"
            ? "Request to connect and share location, "
            : "Request to connect on no share location, ";
            
        const payload = JSON.stringify({
          title: sender.username,
          body: txt + tm,
          imgUrl: inversion.encrypt(phoneNumber),
        });

        if (!subscription || Object.keys(subscription).length <= 0) {
            return;
        }

        webp
        .sendNotification(subscription, payload)
        .catch((err) => console.error("Error sending push notification", err));
    }
}

module.exports.requestConn = requestConn;
