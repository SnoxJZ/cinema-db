const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");

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

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};
