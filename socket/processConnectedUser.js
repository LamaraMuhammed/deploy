
const { schema } = require('../models/model');

async function connectedUser(id, phoneNumber, userName, callback) {
    try {
        await schema.OnLineUser.findOneAndUpdate(
            {phone_number: phoneNumber},
            {
                id: id[0],
                username: userName,
                connectedRoutes: new Map(),
                entry: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                outrage: null,
                online: "ON"
            }
        );
        
        callback(id[0], "grant-access", {
            phoneNo: phoneNumber,
            username: userName,
            prof_img: id[1]
        });

    } catch (err) {
        callback(id[0], 'warning', "Error: Please refresh your browser.");
    }
}


module.exports.processConnectedUser = connectedUser;