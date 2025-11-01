const axios = require("axios");

exports.userClient = axios.create({
  baseURL: `${process.env.USER_SERVICE_URL}/api`,
  timeout: 10000,
});
