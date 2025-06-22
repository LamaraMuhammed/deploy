const jwt = require("jsonwebtoken");

module.exports = function verifyId(token) {
    // Middleware to log request details
    try {
        // Verify the token using the secret key
        const data = jwt.verify(JSON.parse(token), process.env.KEY);
        return data;
        
    } catch (err) {
        // Handle token verification error
        return null;
    }
}