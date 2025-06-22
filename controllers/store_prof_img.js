const fs = require("fs");
const sharp = require("sharp");

const { inspect } = require("../utils/checkPoint");
const { schema } = require("../models/model");

module.exports = async function (req, res) {
  const { _ck, referer, fetchSite } = res.user;
  const { n } = req.params;
  const file = req.file;

  if (!file || !referer || fetchSite === "none" || !_ck || n !== "upload") {
    res.sendStatus(401).end();
    return;
  }

  const ck = await inspect.parseCookie(_ck);

  if (ck.phone_number) {
    var fileBuffer, imageBinary;
    try {
      const fileSize = file.size / (1024 * 1024); // to MB
      fileBuffer = fs.readFileSync(file.path);

      //  resizing the Img to width 150 pixels and of height 200 pixels
      //  and save it to the disk
      //  and also convert it to binary
      if (fileSize > 2) {
        await sharp(fileBuffer).resize({ width: 700 }).toFile(file.path);

        imageBinary = await sharp(fileBuffer)
          .resize({ width: 700 })
          .jpeg({ quality: 80, chromaSubsampling: "4:4:4" })
          .toBuffer();
      } else {
        await sharp(fileBuffer).toFile(file.path);

        imageBinary = await sharp(fileBuffer)
          .jpeg({ quality: 80, chromaSubsampling: "4:4:4" })
          .toBuffer();
      }
    } catch (error) {
      res.json({ err: "Profile image processing failed" });
      return;
    }

    try {
      await schema.UserImage.findOneAndUpdate(
        { img_id: ck.phone_number },
        {
          imgName: file.filename,
          data: imageBinary,
          contentType: file.mimetype,
          time: new Date().toISOString(),
        },
        { new: true }
      );
    } catch (err) {
      fs.unlinkSync(file.path);
      res.json({ err: "Profile image processing failed" });
      return;
    }

    res.json({ img: true });
    res.end();
    return;
  }
};
