const {
  sendError,
  relatedMovieAggregation,
  topRatedMoviesPipeline,
} = require("../utils/helper");
const cloudinary = require("../cloud");
const Movie = require("../models/movie");
const { isValidObjectId } = require("mongoose");
const { actorClient } = require("../clients/actorClient");

exports.uploadTrailer = async (req, res) => {
  const { file } = req;
  if (!file) return sendError(res, "Video not found!");

  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      resource_type: "video",
    }
  );
  res.status(201).json({ url, public_id });
};

exports.createMovie = async (req, res) => {
  const { file, body } = req;

  const {
    title,
    storyLine,
    director,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = body;

  const newMovie = new Movie({
    title,
    storyLine,
    releseDate,
    status,
    type,
    genres: typeof genres === "string" ? JSON.parse(genres) : genres,
    tags: typeof tags === "string" ? JSON.parse(tags) : tags,
    cast: typeof cast === "string" ? JSON.parse(cast) : cast,
    trailer,
    language,
  });

  if (director) {
    if (!isValidObjectId(director))
      return sendError(res, "Invalid director ID!");
    newMovie.director = director;
  }

  if (writers) {
    const parsedWriters =
      typeof writers === "string" ? JSON.parse(writers) : writers;
    for (let writerId of parsedWriters) {
      if (!isValidObjectId(writerId))
        return sendError(res, "Invalid writer ID!");
    }
    newMovie.writers = parsedWriters;
  }

  // poster upload
  if (file) {
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });

    const finalPoster = { url, public_id, responsive: [] };

    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalPoster.responsive.push(secure_url);
      }
    }
    newMovie.poster = finalPoster;
  }

  await newMovie.save();

  res.status(201).json({
    movie: {
      id: newMovie._id,
      title,
    },
  });
};

exports.updateMovieWithoutPoster = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie ID!");

  const movie = await Movie.findById(movieId);
  if (!movie) return sendError(res, "Film not found!", 404);

  const {
    title,
    storyLine,
    director,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releseDate = releseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director))
      return sendError(res, "Invalid director ID!");
    movie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId))
        return sendError(res, "Invalid writer ID!");
    }

    movie.writers = writers;
  }

  await movie.save();

  res.json({ message: "Movie updated!", movie });
};

exports.updateMovie = async (req, res) => {
  const { movieId } = req.params;
  const { file } = req;

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie ID!");

  const movie = await Movie.findById(movieId);
  if (!movie) return sendError(res, "Film not found!", 404);

  const {
    title,
    storyLine,
    director,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releseDate = releseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.cast = cast;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director))
      return sendError(res, "Invalid director ID!");
    movie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId))
        return sendError(res, "Invalid writer ID!");
    }

    movie.writers = writers;
  }

  if (file) {
    const posterID = movie.poster?.public_id;
    if (posterID) {
      const { result } = await cloudinary.uploader.destroy(posterID);
      if (result !== "ok") {
        return sendError(res, "Poster could not be updated!");
      }

      const {
        secure_url: url,
        public_id,
        responsive_breakpoints,
      } = await cloudinary.uploader.upload(req.file.path, {
        transformation: {
          width: 1280,
          height: 720,
        },
        responsive_breakpoints: {
          create_derived: true,
          max_width: 640,
          max_images: 3,
        },
      });

      const finalPoster = { url, public_id, responsive: [] };

      const { breakpoints } = responsive_breakpoints[0];
      if (breakpoints.length) {
        for (let imgObj of breakpoints) {
          const { secure_url } = imgObj;
          finalPoster.responsive.push(secure_url);
        }
      }

      movie.poster = finalPoster;
    }
  }

  await movie.save();

  res.json({
    message: "Movie updated!",
    movie: {
      id: movie._id,
      title: movie.title,
      poster: movie.poster?.url,
      genres: movie.genres,
      status: movie.status,
    },
  });
};

exports.removeMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie ID!");

  const movie = await Movie.findById(movieId);
  if (!movie) return sendError(res, "Film not found!", 404);

  const posterId = movie.poster?.public_id;
  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);
    if (result !== "ok") return sendError(res, "Poster not found!");
  }

  const trailerId = movie.trailer?.public_id;
  if (!trailerId) return sendError(res, "Trailer not found!");
  const { result } = await cloudinary.uploader.destroy(trailerId, {
    resource_type: "video",
  });
  if (result !== "ok") return sendError(res, "Trailer not found!");

  await Movie.findByIdAndDelete(movieId);

  res.json({ message: "Movie deleted!" });
};

exports.getMovies = async (req, res) => {
  const {
    pageNo = 0,
    limit = 30,
    type,
    actorId,
    genre,
    sortBy = "createdAt",
  } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (genre) filter.genres = genre;
  if (actorId) {
    filter.$or = [
      { director: actorId },
      { producers: actorId },
      { writers: actorId },
      { "cast.actor": actorId },
    ];
  }

  const sortOptions = {
    createdAt: { createdAt: -1 },
    releseDate: { releseDate: -1 },
    ratingAvg: { "reviewStats.ratingAvg": -1 },
  };

  const [movies, totalMovies] = await Promise.all([
    Movie.find(filter)
      .sort(sortOptions[sortBy] || sortOptions.createdAt)
      .skip(parseInt(pageNo) * parseInt(limit))
      .limit(parseInt(limit)),
    Movie.countDocuments(filter),
  ]);

  const mapMovies = (m) => {
    return {
      id: m._id,
      title: m.title,
      poster: m.poster?.url,
      responsivePosters: m.poster?.responsive,
      genres: m.genres,
      status: m.status,
      reviews: {
        ratingAvg: m.reviewStats?.ratingAvg,
        reviewCount: m.reviewStats?.reviewCount,
      },
    };
  };

  const results = movies.map(mapMovies);

  res.json({
    movies: results,
    totalMovies,
    pageCount: Math.ceil(totalMovies / parseInt(limit)),
  });
};

exports.getMovieForUpdate = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, "Invalid ID!");

  const movie = await Movie.findById(movieId);
  if (!movie) return sendError(res, "Movie not found!");

  const actorIds = [
    movie.director,
    ...movie.writers,
    ...movie.cast.map((c) => c.actor),
  ]
    .filter(Boolean)
    .map((id) => id.toString());

  const uniqueActorIds = [...new Set(actorIds)];

  const { data: actors } = await actorClient.post("/actor/internal/batch", {
    ids: uniqueActorIds,
  });

  const actorMap = actors.reduce((acc, a) => ({ ...acc, [a.id]: a }), {});

  res.json({
    movie: {
      id: movie._id,
      title: movie.title,
      storyLine: movie.storyLine,
      poster: movie.poster?.url,
      releseDate: movie.releseDate,
      status: movie.status,
      type: movie.type,
      language: movie.language,
      genres: movie.genres,
      tags: movie.tags,
      director: actorMap[movie.director?.toString()] || null,
      writers: movie.writers.map((w) => actorMap[w.toString()]).filter(Boolean),
      cast: movie.cast.map((c) => {
        return {
          id: c.id,
          actor: actorMap[c.actor.toString()],
          roleAs: c.roleAs,
          leadActor: c.leadActor,
        };
      }),
    },
  });
};

exports.searchMovies = async (req, res) => {
  const { title } = req.query;

  if (!title.trim()) return sendError(res, "Invalid request!");

  const movies = await Movie.find({ title: { $regex: title, $options: "i" } });
  res.json({
    results: movies.map((m) => {
      return {
        id: m._id,
        title: m.title,
        poster: m.poster?.url,
        genres: m.genres,
        status: m.status,
      };
    }),
  });
};

exports.getLatestUploads = async (req, res) => {
  const { limit = 20 } = req.query;

  const results = await Movie.find({ status: "public" })
    .sort("-createdAt")
    .limit(parseInt(limit));

  const movies = results.map((m) => {
    return {
      id: m._id,
      title: m.title,
      storyLine: m.storyLine,
      poster: m.poster?.url,
      responsivePosters: m.poster.responsive,
      trailer: m.trailer?.url,
    };
  });
  res.json({ movies });
};

exports.getSingleMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId))
    return sendError(res, "Movie id is not valid!");

  const movie = await Movie.findById(movieId);
  if (!movie) return sendError(res, "Movie not found!", 404);

  const actorIds = [
    movie.director,
    ...movie.writers,
    ...movie.producers,
    ...movie.cast.map((c) => c.actor),
  ]
    .filter(Boolean)
    .map((id) => id.toString());

  const uniqueActorIds = [...new Set(actorIds)];

  const { data: actors } = await actorClient.post("/actor/internal/batch", {
    ids: uniqueActorIds,
  });

  const actorMap = actors.reduce((acc, a) => ({ ...acc, [a.id]: a }), {});

  let isFavorite = false;
  if (req.user) {
    isFavorite = req.user.favorites.some((fav) => fav.toString() === movieId);
  }

  const {
    _id: id,
    title,
    storyLine,
    cast,
    writers,
    producers,
    director,
    releseDate,
    genres,
    tags,
    language,
    poster,
    trailer,
    type,
    reviewStats,
  } = movie;

  res.json({
    movie: {
      id,
      title,
      storyLine,
      releseDate,
      genres,
      tags,
      language,
      type,
      poster,
      trailer,
      cast: cast
        .map((c) => {
          const actor = actorMap[c.actor.toString()];
          if (!actor) return null;
          return {
            id: c._id,
            actor: {
              id: actor.id,
              name: actor.name,
              avatar: actor.avatar,
            },
            leadActor: c.leadActor,
            roleAs: c.roleAs,
          };
        })
        .filter(Boolean),
      producers: producers
        .map((pId) => {
          const producer = actorMap[pId.toString()];
          if (!producer) return null;
          return {
            id: producer.id,
            name: producer.name,
            avatar: producer.avatar,
          };
        })
        .filter(Boolean),
      writers: writers
        .map((wId) => {
          const writer = actorMap[wId.toString()];
          if (!writer) return null;
          return {
            id: writer.id,
            name: writer.name,
            avatar: writer.avatar,
          };
        })
        .filter(Boolean),
      director: director
        ? (() => {
            const dir = actorMap[director.toString()];
            return dir
              ? {
                  id: dir.id,
                  name: dir.name,
                  avatar: dir.avatar,
                }
              : null;
          })()
        : null,
      reviews: { ...reviewStats },
      isFavorite,
    },
  });
};

exports.getRelatedMovies = async (req, res) => {
  const { movieId } = req.params;
  if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie ID!");

  const movie = await Movie.findById(movieId);
  if (!movie) return sendError(res, "Movie not found!");

  const movies = await Movie.aggregate(
    relatedMovieAggregation(movie.tags, movie._id)
  );

  const relatedMovies = movies.map((m) => ({
    id: m._id,
    title: m.title,
    poster: m.poster,
    responsivePosters: m.responsivePosters,
    reviews: m.reviewStats ? { ...m.reviewStats } : null,
  }));

  res.json({ movies: relatedMovies });
};

exports.getTopRatedMovies = async (req, res) => {
  const { type = "Movie" } = req.query;

  const movies = await Movie.aggregate(topRatedMoviesPipeline(type));

  const topRatedMovies = movies.map((m) => ({
    id: m._id,
    title: m.title,
    poster: m.poster,
    responsivePosters: m.responsivePosters,
    reviews: {
      ratingAvg: m.ratingAvg,
      reviewCount: m.reviewCount,
    },
  }));

  res.json({ movies: topRatedMovies });
};

exports.searchPublicMovies = async (req, res) => {
  const { title } = req.query;

  if (!title.trim()) return sendError(res, "Invalid request!");

  const { data: actors } = await actorClient.get(
    "/actor/internal/get-all?name=" + title + "&limit=100"
  );

  const actorIds = actors?.profiles?.map((a) => a.id) || [];

  const movies = await Movie.find({
    status: "public",
    $or: [
      { title: { $regex: title, $options: "i" } },
      { genres: { $in: [title] } },
      { director: { $in: actorIds } },
      { writers: { $in: actorIds } },
      { cast: { $elemMatch: { actor: { $in: actorIds } } } },
    ],
  });

  const mapMovies = async (m) => {
    return {
      id: m._id,
      title: m.title,
      poster: m.poster?.url,
      responsivePosters: m.poster?.responsive,
      reviews: { ...m.reviewStats },
    };
  };

  const results = await Promise.all(movies.map(mapMovies));

  res.json({
    results,
  });
};

///
exports.updateReviewStats = async (req, res) => {
  const { id } = req.params;
  const { ratingAvg, reviewCount, addReviewId, removeReviewId } = req.body;

  const movie = await Movie.findById(id);
  if (!movie) return sendError(res, "Movie not found!");

  if (addReviewId) {
    movie.reviews.push(addReviewId);
  }
  if (removeReviewId) {
    movie.reviews = movie.reviews.filter(
      (r) => r.toString() !== removeReviewId
    );
  }
  movie.reviewStats.ratingAvg = ratingAvg;
  movie.reviewStats.reviewCount = reviewCount;
  await movie.save();

  res.json({ success: true });
};

exports.getMoviesBatch = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) return sendError(res, "Invalid request");

  const movies = await Movie.find({ _id: { $in: ids } }).select(
    "title poster genres status reviewStats"
  );

  const formattedMovies = movies.map((m) => ({
    id: m._id,
    title: m.title,
    poster: m.poster,
    genres: m.genres,
    status: m.status,
    reviewStats: m.reviewStats,
  }));

  res.json(formattedMovies);
};

exports.getMovieCount = async (req, res) => {
  const count = await Movie.countDocuments();
  res.json({ count });
};
