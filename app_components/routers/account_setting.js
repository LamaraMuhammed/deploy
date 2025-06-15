const express = require("express");
const router = express.Router();

const { inspect } = require("../utils/checkPoint");

router.get("/", async (req, res) => {
    const { fetchSite, _ck } = res.user;

    if (fetchSite === 'none') {
        res.sendStatus(401).end();
        return;
    }
    
    if (!_ck) {
        res.redirect("/");
        return;
    }
    
    const ck = await inspect.parseCookie(_ck);

    if (!ck?.id) {
        res.redirect("/");
        return;
    }

    res.render("account_setting");
    res.end();
});

module.exports = router;