const mongoose = require("mongoose");
const { Schema } = mongoose;

const Preference = Schema({
    phone_number: {
        type: String
    },
    trip_bank: {
        eventDate: {
            type: String, default: null
        },
        coords: [{
            type: Object, default: null
        }]
    },
    close_watch: {
        watchers: {
            type: Map, default: new Map()
        }
    }
});


module.exports = mongoose.model("UsersPreference", Preference);