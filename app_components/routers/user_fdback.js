const express = require("express");
const router = express.Router();

//  README
router.get("/:n", (req, res) => {
  //   if (req.path === "/readMe") res.render("readMe");
  if (req.params?.n === "readMe") res.json({ 1: "Hello Inyass!" });
  return res.end();
});

//  FEEDBACK
router.get("/", (req, res) => {
  const { fetchSite, _ck } = res.user;

  if (fetchSite === "none") {
    res.sendStatus(401).end();
    return;
  }

  if (!_ck) {
    res.redirect("/Home");
    return;
  }

  res.render("feedback");
  res.end();
});

module.exports = router;
