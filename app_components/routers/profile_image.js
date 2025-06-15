const express = require('express');
const router = express.Router();

const profile_img = require('./controllers/profile_img');
const store_prof_img = require('./controllers/store_prof_img');
const upload = require('./controllers/img_handler');

router.get('/:n', (req, res) => {
    profile_img(req, res);
});

router.post("/:n", upload.single("file"), (req, res) => {
  store_prof_img(req, res);
});

module.exports = router;