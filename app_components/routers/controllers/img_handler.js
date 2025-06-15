const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { inspect } = require("../../utils/checkPoint");

//  User Image Storing and Processing Using Multer
var sender, filename;
const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    const ck = req.headers.cookie;

    if (ck) {
      sender = await inspect.parseCookie(ck);

      if (sender.phone_number) {
        callback(null, "userProfilePictures");
      } else {
        callback(null, "unAuthenticatedImages");
      }
    }
  },

  filename: (req, file, callback) => {
    if (sender.phone_number) {
      filename = Date.now() + path.extname(file.originalname);
      callback(null, filename);
      
    } else {
      let filename = "trash.png";
      callback(null, filename);

      return del(true, `unAuthenticatedImages/${filename}`);
    }
  },
});

// delete unauthorized img
function del(cmd, path) {
  if (cmd) {
    setTimeout(() => {
      fs.unlink(path, (err) => {
        if (err) return null;
      });
    }, 2000);
  }
}

var maxSize = 5.1 * 1024 * 1024; // 5.1MB allowed or less than
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
});

module.exports = upload;
