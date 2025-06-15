const allowOrigins = require("./allowOrigins");

const corsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin
        if (!origin) return callback(null, true);
        if (allowOrigins.indexOf(origin) === -1) {
            const message = `The CORS policy for this site does not allow access from the specified Origin.`;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    },
    credentials: true, // Access-Control-Allow-Credentials: true
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

module.exports = corsOptions;