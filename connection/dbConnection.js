const mysql = require('mysql2');
const mongoose = require("mongoose");
const url = process.env.MONGODB_URL;
// const url = "mongodb://localhost:27017/WebG";


// const connection = mysql.createConnection(JSON.parse(process.env.SQL));

// connection.connect((err) => {
//     if (err) {
//         return "DB Connecting Error";
//     }
// });

// mongoose db connection
mongoose.connect(url)
    .then( (conn) => console.log('Mongoose connection'))
    .catch(err => console.error("ERROR: ", err));


module.exports = {
    // connection,
    mysql
}