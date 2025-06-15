module.exports = function (req, res, next) {
    // Middleware to log request details
    const logDetails = {
        dvc: req.headers['user-agent'],
        _ck: req.headers.cookie || null,
        route_name: String(req.originalUrl).split('/')[1] || '/',
        referer: req.headers["referer"],
        fetchSite: req.headers["sec-fetch-site"],
    };

    // Proceed to the next middleware or route handler
    res.user = logDetails;
    next();
}