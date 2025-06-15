const jwt = require("jsonwebtoken");

module.exports = function signId(id, phn) {
    // Middleware to log request details
    const token = jwt.sign(
        { id: id, phn: phn },
        process.env.KEY,
        { expiresIn: "7d" }
    );
    
    return token;
}