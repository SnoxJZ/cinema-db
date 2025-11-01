const axios = require("axios");

exports.reviewClient = axios.create({
  baseURL: `${process.env.REVIEW_SERVICE_URL}/api`,
  timeout: 10000,
});
