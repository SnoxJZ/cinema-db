const { isValidObjectId } = require("mongoose");
const Actor = require("../models/actor");
const {
  sendError,
  uploadImageToCloud,
  formatActor,
} = require("../utils/helper");
const cloudinary = require("../cloud");

exports.createActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;

  const newActor = new Actor({ name, about, gender });

  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path);
    newActor.avatar = { url, public_id };
  }
  await newActor.save();
  res.status(201).json({ actor: formatActor(newActor) });
};

exports.updateActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;
  const { actorId } = req.params;

  if (!isValidObjectId(actorId)) return sendError(res, "Invalid request!");

  const actor = await Actor.findById(actorId);
  if (!actor) return sendError(res, "Invalid request, record not found!");

  const public_id = actor.avatar?.public_id;

  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return sendError(res, "Image could not be removed from cloud!");
    }
  }

  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path);
    actor.avatar = { url, public_id };
  }

  actor.name = name;
  actor.about = about;
  actor.gender = gender;

  await actor.save();

  res.status(201).json({ actor: formatActor(actor) });
};

exports.removeActor = async (req, res) => {
  const { actorId } = req.params;

  if (!isValidObjectId(actorId)) return sendError(res, "Invalid request!");

  const actor = await Actor.findById(actorId);
  if (!actor) return sendError(res, "Invalid request, record not found!");

  const public_id = actor.avatar?.public_id;

  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return sendError(res, "Image could not be removed from cloud!");
    }
  }

  await Actor.findByIdAndDelete(actorId);

  res.json({ message: "Actor deleted!" });
};

exports.searchActor = async (req, res) => {
  const { name } = req.query;

  if (!name.trim()) return sendError(res, "Invalid request!");
  const result = await Actor.find({
    name: { $regex: name, $options: "i" },
  });

  const actors = result.map((actor) => formatActor(actor));
  res.json({ results: actors });
};

exports.getLatestActors = async (req, res) => {
  const result = await Actor.find().sort({ createdAt: "-1" }).limit(12);

  const actors = result.map((actor) => formatActor(actor));

  res.json(actors);
};

exports.getSingleActor = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) return sendError(res, "Invalid request!");

  const actor = await Actor.findById(id);
  if (!actor) return sendError(res, "Invalid request, actor not found!", 404);
  res.json({ actor: formatActor(actor) });
};

exports.getActors = async (req, res) => {
  const { pageNo, limit, name } = req.query;

  const query = {};
  if (name) query.name = { $regex: name, $options: "i" };

  const actors = await Actor.find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  const profiles = actors.map((actor) => formatActor(actor));
  res.json({
    profiles,
  });
};

///
exports.getActorsBatch = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) return sendError(res, "Invalid request");

  const actors = await Actor.find({ _id: { $in: ids } });

  const formattedActors = actors.map((a) => ({
    _id: a._id,
    id: a._id,
    apiId: a.apiId,
    name: a.name,
    about: a.about,
    avatar: a.avatar,
    gender: a.gender,
    birthday: a.birthday,
  }));

  res.json(formattedActors);
};
