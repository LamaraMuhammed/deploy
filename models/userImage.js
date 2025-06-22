const mongoose = require("mongoose");
const { Schema } = mongoose;

const Pictures = Schema({
    img_id: {
        type: String
    },
    imgName: {
        type: String
    },
    data: {
        type: Buffer
    },
    contentType: {
        type: String
    },
    time: {
        type: String
    }
});


module.exports = mongoose.model("UserPictures", Pictures);