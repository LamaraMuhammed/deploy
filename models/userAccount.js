const mongoose = require("mongoose");
const { Schema } = mongoose;

const UsersAccounts = Schema({
    id_token: {
        type: String, required: true
    },
    first_Name: {
        type: String, required: true
    },
    last_Name: {
        type: String, required: true
    },
    phone_number: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    },
    dateOfBirth: {
        type: String, required : true
    },
    gender: {
        type: String, required : true
    },
    state: {
        type: String
    },
    town: {
        type: String
    },
    device: {
        type: String
    },
    log_status: {
        type: String, default: '$_new'
    },
    created_at: { type: Date, default: Date.now }
});


module.exports = mongoose.model("UsersAccounts", UsersAccounts);