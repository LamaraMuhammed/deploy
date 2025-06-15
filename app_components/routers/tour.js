const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const { _ck } = res.user;
    
    if (!_ck) {
        res.redirect("/Home");
        return;
    }
    
    res.render("tour");
    res.end();
});

module.exports = router;