const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");

exports.validateMovie = [
  check("title")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Content title cannot be empty!"),
  check("storyLine")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Storyline cannot be empty!"),
  check("language")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Language cannot be empty!"),
  check("releseDate").isDate().withMessage("Release Date"),
  check("status")
    .isIn(["public", "private"])
    .withMessage("Please specify content status!"),
  check("type")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Content type cannot be empty!"),
  check("tags")
    .isArray({ min: 1 })
    .withMessage("Tags must contain words!")
    .custom((tags) => {
      for (let tag of tags) {
        if (typeof tag !== "string") throw Error("Tags must contain words!");
      }

      return true;
    }),
  check("cast")
    .isArray()
    .withMessage("Error")
    .custom((cast) => {
      for (let c of cast) {
        if (!isValidObjectId(c.actor)) throw Error("Invalid ID!");
        if (!c.roleAs?.trim()) throw Error("Invalid role ID");
        if (typeof c.leadActor !== "boolean")
          throw Error(
            "Only boolean values for lead actor are accepted in the cast!"
          );
      }

      return true;
    }),
];

exports.validateTrailer = check("trailer")
  .isObject()
  .withMessage("Error!")
  .custom(({ url, public_id }) => {
    try {
      const result = new URL(url);
      if (!result.protocol.includes("http")) throw Error("Invalid trailer ID!");

      const arr = url.split("/");
      const publicId = arr[arr.length - 1].split(".")[0];

      if (public_id !== publicId) throw Error("Invalid trailer ID!");

      return true;
    } catch (error) {
      throw Error("Invalid trailer ID!");
    }
  });

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};
