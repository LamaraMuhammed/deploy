module.exports = function error_logger(err, req, res, next) {
  // Middleware to log request details
  const logDetails = {
    // method: req.method,
    // url: req.originalUrl,
    // err: err.message,
    // stack: err.stack,
    // code: err.code || 500,
    // dvc: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  };

  // Log the details to the console (or a file, or a logging service)
  console.log("Error Details:", logDetails, err);
  // res.json({ err: "Try again, sending or handling error on both end" });
};
