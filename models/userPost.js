
const mongoose = require('mongoose');
const { _id } = require('../../.env/keys');
const schema = mongoose.Schema;

const postCont = new schema ({
    id: { type: Number, default: _id },
    userName: String,
    phone_no: String,
    blob: Buffer,
    content: Object,
    event: String
});

postCont.pre('save', (next) => {
    if (!this.id) {
        this.id = _id;
    } 
    next();
});

module.exports = mongoose.model('PostContent', postCont);
