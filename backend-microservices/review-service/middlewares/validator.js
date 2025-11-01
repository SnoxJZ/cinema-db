const { check, validationResult } = require("express-validator");

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
