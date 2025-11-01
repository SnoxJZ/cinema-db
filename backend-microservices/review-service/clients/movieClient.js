const axios = require("axios");

exports.movieClient = axios.create({
  baseURL: `${process.env.MOVIE_SERVICE_URL}/api`,
  timeout: 10000,
});
