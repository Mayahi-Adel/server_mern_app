const UserModel = require("../models/user.model");
const fs = require("fs");
const { uploadErrors } = require("../utils/errors.utils");

module.exports.uploadProfil = async (req, res) => {
  try {
    const file = req?.file;

    if (
      file == undefined ||
      (req?.file?.mimetype != "image/jpg" &&
        req?.file?.mimetype != "image/png" &&
        req?.file?.mimetype != "image/jpeg")
    )
      throw Error("Invalid file");

    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.send({ errors });
  }

  // rename the picture (it takes the pseudo of the user)
  const fileName = req.file.filename;
  const newFileName = req.body.name + ".jpg";
  fs.rename(
    `${__dirname}/../client/public/uploads/profil/${fileName}`,
    `${__dirname}/../client/public/uploads/profil/${newFileName}`,
    function (err) {
      if (err) console.log("ERROR: " + err);
    }
  );

  try {
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profil/" + newFileName } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) res.send(docs);
        else return res.status(500).json({ message: err });
      }
    );
  } catch (err) {
    //res.status(500).json({ message: err });
  }
};
