const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.url === "/upload") {
      cb(null, `${__dirname}/../client/public/uploads/profil`);
    }
    if (req.url === "/") {
      cb(null, `${__dirname}/../client/public/uploads/posts`);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("jpeg") ||
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg")
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

let upload = (exports.upload = multer({
  storage: multerStorage,
  limits: {
    //fileSize: 500000, // 1000000 Bytes = 1 MB
  },
  fileFilter: fileFilter,
}).single("file"));
