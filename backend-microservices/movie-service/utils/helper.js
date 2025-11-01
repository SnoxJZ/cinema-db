exports.sendError = (res, error, statusCode = 401) =>
  res.status(statusCode).json({ error });

exports.handleNotFound = (req, res) => {
  this.sendError(res, "Not found", 404);
};

exports.parseData = (req, res, next) => {
  const { trailer, cast, genres, tags, writers } = req.body;
  if (trailer) req.body.trailer = JSON.parse(trailer);
  if (cast) req.body.cast = JSON.parse(cast);
  if (genres) req.body.genres = JSON.parse(genres);
  if (tags) req.body.tags = JSON.parse(tags);
  if (writers) req.body.writers = JSON.parse(writers);

  next();
};

exports.relatedMovieAggregation = (tags, movieId) => [
  {
    $match: {
      tags: { $in: tags },
      _id: { $ne: movieId },
      status: "public",
    },
  },
  {
    $project: {
      title: 1,
      poster: "$poster.url",
      responsivePosters: "$poster.responsive",
      reviewStats: 1,
    },
  },
  {
    $limit: 6,
  },
];

exports.topRatedMoviesPipeline = (type) => {
  const matchOptions = {
    status: "public",
    "reviewStats.reviewCount": { $gt: 0 },
  };

  if (type) matchOptions.type = type;

  return [
    { $match: matchOptions },
    {
      $project: {
        title: 1,
        poster: "$poster.url",
        responsivePosters: "$poster.responsive",
        ratingAvg: "$reviewStats.ratingAvg",
        reviewCount: "$reviewStats.reviewCount",
      },
    },
    { $sort: { ratingAvg: -1, reviewCount: -1 } },
    { $limit: 6 },
  ];
};
