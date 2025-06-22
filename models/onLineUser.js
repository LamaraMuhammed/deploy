const mongoose = require("mongoose");
const { Schema } = mongoose;

const OnlineUsers = Schema({
    id: {
        type: String, default: ''
    },
    username: {
        type: String, default: ''
    },
    phone_number: {
        type: String
    },
    listening: {
        type: Map, default: new Map()
    },
    connectedRoutes: {
        type: Map, default: new Map()
    },
    notification: [{
        type: Object
    }],
    register: {
        type: Schema.Types.ObjectId, ref: "UsersAccounts"
    },
    picture: {
        type: Schema.Types.ObjectId, ref: "UserPictures"
    },
    trip_bank: {
        type: Schema.Types.ObjectId, ref: "UsersTripBank"
    },
    entry: {
        type: String, default: ''
    },
    outrage: {
        type: String, default: ''
    },
    online: {
        type: String, default: ''
    }
});


module.exports = mongoose.model("OnlineUsers", OnlineUsers);