const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const genres = require("../utils/genres");

exports.userValidtor = [
  check("name").trim().not().isEmpty().withMessage("Name cannot be empty!"),
  check("email").normalizeEmail().isEmail().withMessage("Invalid email!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password cannot be empty!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!"),
];

exports.validatePassword = [
  check("newPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!"),
];

exports.signInValidator = [
  check("email").normalizeEmail().isEmail().withMessage("Invalid email!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password cannot be empty!"),
];

exports.actorInfoValidator = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Actor name cannot be empty!"),
  check("about")
    .trim()
    .not()
    .isEmpty()
    .withMessage("About is a required field!"),
  check("gender")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Gender is a required field!"),
];

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

exports.validateRatings = check(
  "rating",
  "Rating must be a number between 0 and 10."
).isFloat({ min: 0, max: 10 });

exports.validateReplyContent = [
  check("content")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Content is required!")
    .isLength({ min: 3, max: 1000 })
    .withMessage("Content must be between 3 and 1000 characters"),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};
