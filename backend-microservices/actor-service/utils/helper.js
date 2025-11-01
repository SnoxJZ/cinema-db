const cloudinary = require("../cloud");

exports.sendError = (res, error, statusCode = 401) =>
  res.status(statusCode).json({ error });

exports.handleNotFound = (req, res) => {
  this.sendError(res, "Not found", 404);
};

exports.uploadImageToCloud = async (file) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file,
    { gravity: "face", height: 500, width: 500, crop: "thumb" }
  );

  return { url, public_id };
};

exports.formatActor = (actor) => {
  const { apiId, name, gender, about, _id, avatar, birthday } = actor;
  return {
    id: _id,
    apiId,
    name,
    about,
    gender,
    avatar,
    birthday,
  };
};
