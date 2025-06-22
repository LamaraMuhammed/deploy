const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {

  console.log(req.body);
  return res.sendStatus(200).end();
});

module.exports = router;
