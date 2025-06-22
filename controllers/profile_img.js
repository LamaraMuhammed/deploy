const Cookie = require("cookie");
const fs = require("fs");

const { schema } = require("../models/model");
const { inversion } = require("../utils/inversion");

module.exports = async function (req, res) {
  const { referer, fetchSite, _ck } = res.user;
  const value = req.params?.n;

  if (!referer || fetchSite === "none") {
    res.sendStatus(404);
    return;
  }

  if (!_ck) {
    default_img(res);
    return;
  }

  try {
    const cookie = JSON.parse(Cookie.parse(_ck).credentials);
    if (value && cookie._st_ !== "0") {
      if (value === 'self') {
        default_img(res);
        return;
      }

      const image = await schema.UserImage.findOne({ img_id: inversion.decrypt(value) });
      if (!image || !image.data) {
        default_img(res);
        return;
      }

      res.set("Content-Type", image.contentType);
      return res.send(image.data);
    }
  } catch (err) {
    return;
  }
};

function default_img(res) {
  try {
    fs.readFile("./public/icons/icon.png", (err, data) => {
      if (err) {
        setTimeout(() => default_img(), 2000);
        return;
        
      } else {
        res.set("Content-Type", "image/jpg");
        return res.send(data);
      }
    });
      
  } catch (err) {
    return;
  }
}
