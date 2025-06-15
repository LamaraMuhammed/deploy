
async function processChatMessages(username, phoneNumber, msg, callback) {
    if (msg.ids) {
        msg.ids.forEach(id => {
            if (id) callback(id, 'chat-response', {sender: username, imgUrl: phoneNumber, msg: msg.msg});
        });

    } else {
        callback(msg.id, 'chat-response', {sender: username, imgUrl: phoneNumber, msg: msg.msg});
    }
}


module.exports.processChatMessages = processChatMessages;