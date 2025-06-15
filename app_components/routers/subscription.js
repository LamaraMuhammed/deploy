const express = require("express");
const router = express.Router();

const vapid = require("../../config/vapid");

// db
const subscribers = [];

router.get("/:n", (req, res) => {
  const { _ck, fetchSite } = res.user;
  const { n } = req.params;

  if (!_ck || fetchSite === "none" || n !== "get-key") {
    res.sendStatus(401).end();
    return;
  }

  res.status(200).json({ publicKey: vapid.pub_key }).end();
  //   unsubscribe(req, res);
});

router.post("/:n", (req, res) => {
  const { _ck, fetchSite } = res.user;
  const { subscription } = req.body;
  const { n } = req.params;

  if (!_ck || fetchSite === "none" || n !== "save") {
    res.sendStatus(401).end();
    return;
  }

  // Store the subscription in your database or in-memory array
  // For demonstration, we'll just push it to an array
  if (!subscription || Object.keys(subscription).length <= 0) {
    res.status(400).json({ error: "Subscription is required" });
    return;
  }

  //    Store to sub... data in db
  subscribers.push(subscription);
  console.log(subscription);
  res.status(200).json({ message: "Subscribed successfully" });
  res.end();
});

function unsubscribe(req, res) {
  const index = subscribers.findIndex((sub) => sub.endpoint === endpoint);
  if (index === -1) {
    res.status(404).json({ message: "Subscription not found" });
    return;
  }

  subscribers.splice(index, 1);
  res.status(200).json({ message: "Unsubscribed successfully" });
}

module.exports = router;
