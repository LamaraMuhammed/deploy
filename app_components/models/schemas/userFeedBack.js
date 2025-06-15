const mongoose = require('mongoose');
const { Schema } = mongoose;

const userFeedBack = Schema({
  comment_id: {
    type: Number,
    default: process.env.def_id
  },
  comments: {
    type: Object
  },
  viewed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('userFeedBack', userFeedBack);