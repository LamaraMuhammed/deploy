const mysql = require('mysql2');
const mongoose = require("mongoose");
// const url = "mongodb://localhost:27017/WebG";


// const connection = mysql.createConnection(JSON.parse(process.env.SQL));

// connection.connect((err) => {
//     if (err) {
//         return "DB Connecting Error";
//     }
// });

// mongoose db connection
mongoose.connect(process.env.MONGODB_URL)
    .then( (conn) => console.log('Mongoose connection'))
    .catch(err => console.error("ERROR: ", err));


module.exports = {
    // connection,
    mysql
}