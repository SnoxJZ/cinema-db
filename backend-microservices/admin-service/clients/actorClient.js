const axios = require("axios");

exports.actorClient = axios.create({
  baseURL: `${process.env.ACTOR_SERVICE_URL}/api`,
  timeout: 10000,
});
