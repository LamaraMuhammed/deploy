const verify_id = require("../routers/controllers/verify_id");
const { inspect } = require("../utils/checkPoint");


module.exports = async function (socket, next) {
    // Middleware to log request details
    const path = socket.handshake.auth?.path;
    const _token = socket.handshake.auth?.token;
    const ck = socket.handshake.headers.cookie;
    
        console.log("TOKEN: ", _token)
        console.log("SOCKET COOKIE: ", ck)
    
    if (!path || !_token || !ck) {
        // If the token is not present, return an error
        return next(new Error("Authentication token missing"));
    }
    
    // verify token
    const parseCookie = await inspect.parseCookie(ck);
    const tk = verify_id(_token);

    if (!tk || !parseCookie) {
        // If the token is not present, return an error
        return next(new Error({ redirect: true }));
    }
    
    // compare the token with the cookie
    const { id, token, username, phone_number } = parseCookie;
    const { iat, exp, ...user } = tk;
    
    if (token !== user.id && phone_number !== user.phn) {  
        // If the token is not present, return an error
        return next(new Error({ redirect: true }));
    }
    
    // Proceed to the next middleware or route handler
    socket.user = { path, id, username, phone_number};
    next();
}