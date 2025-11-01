const multer = require("multer");
const storage = multer.diskStorage({});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    cb("Only image files are supported!", false);
  }
  cb(null, true);
};

exports.uploadImage = multer({ storage, fileFilter: imageFileFilter });
