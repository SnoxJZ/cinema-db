const {
  sendError,
  formatActor,
  averageRatingPipeline,
  relatedMovieAggregation,
  getAverageRatings,
  topRatedMoviesPipeline,
} = require("../utils/helper");
const cloudinary = require("../cloud");
const Movie = require("../models/movie");
const Review = require("../models/review");
const User = require("../models/user");
const { isValidObjectId } = require("mongoose");
const Actor = require("../models/actor");

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

  // if (!req.file) return sendError(res, "Movie poster not found!");

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

  // update poster
  if (file) {
    const posterID = movie.poster?.public_id;
    console.log(posterID);
    if (posterID) {
      const { result } = await cloudinary.uploader.destroy(posterID);
      if (result !== "ok") {
        return sendError(res, "Poster could not be updated!");
      }

      // uploading poster
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

  // check if poster exists.
  // if exists, then we need to remove it.

  const posterId = movie.poster?.public_id;
  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);
    if (result !== "ok") return sendError(res, "Poster not found!");
  }

  // removing trailer
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

  const movie = await Movie.findById(movieId).populate(
    "director writers cast.actor"
  );

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
      director: formatActor(movie.director),
      writers: movie.writers.map((w) => formatActor(w)),
      cast: movie.cast.map((c) => {
        return {
          id: c.id,
          actor: formatActor(c.actor),
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

  const movie = await Movie.findById(movieId).populate(
    "director writers cast.actor producers"
  );

  if (!movie) return sendError(res, "Movie not found!", 404);

  let isFavorite = false;
  if (req.user) {
    const user = await User.findById(req.user._id);
    isFavorite = user.favorites.some((fav) => fav.toString() === movieId);
  }

  const [aggregatedResponse] = await Review.aggregate(
    averageRatingPipeline(movie._id)
  );

  const reviews = {};

  if (aggregatedResponse) {
    const { ratingAvg, reviewCount } = aggregatedResponse;
    reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1);
    reviews.reviewCount = reviewCount;
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
        .map((c) => ({
          id: c._id,
          actor: c.actor
            ? {
                id: c.actor._id,
                name: c.actor.name,
                avatar: c.actor?.avatar,
              }
            : null,
          leadActor: c.leadActor,
          roleAs: c.roleAs,
        }))
        .filter((c) => c.actor),
      producers:
        producers
          ?.map((p) =>
            p
              ? {
                  id: p._id,
                  name: p.name,
                  avatar: p?.avatar,
                }
              : null
          )
          .filter(Boolean) || [],
      writers:
        writers
          ?.map((w) =>
            w
              ? {
                  id: w._id,
                  name: w.name,
                  avatar: w?.avatar,
                }
              : null
          )
          .filter(Boolean) || [],
      director: director
        ? {
            id: director._id,
            name: director.name,
            avatar: director?.avatar,
          }
        : null,
      reviews: { ...reviews },
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

  const relatedMovies = await Promise.all(
    movies.map(async (m) => {
      const reviews = await getAverageRatings(m._id);
      return {
        id: m._id,
        title: m.title,
        poster: m.poster,
        responsivePosters: m.responsivePosters,
        reviews,
      };
    })
  );

  res.json({ movies: relatedMovies });
};

exports.getTopRatedMovies = async (req, res) => {
  const { type = "Movie" } = req.query;

  const movies = await Movie.aggregate(topRatedMoviesPipeline(type));

  const topRatedMovies = await Promise.all(
    movies.map(async (m) => {
      const reviews = await getAverageRatings(m._id);
      return {
        id: m._id,
        title: m.title,
        poster: m.poster,
        responsivePosters: m.responsivePosters,
        reviews,
      };
    })
  );

  res.json({ movies: topRatedMovies });
};

exports.searchPublicMovies = async (req, res) => {
  const { title } = req.query;

  if (!title.trim()) return sendError(res, "Invalid request!");

  const directors = await Actor.find({
    name: { $regex: title, $options: "i" },
  }).select("_id");

  const directorIds = directors.map((d) => d._id);

  const movies = await Movie.find({
    status: "public",
    $or: [
      { title: { $regex: title, $options: "i" } },
      { genres: { $in: [title] } },
      { director: { $in: directorIds } },
    ],
  });

  const mapMovies = async (m) => {
    const reviews = await getAverageRatings(m._id);

    return {
      id: m._id,
      title: m.title,
      poster: m.poster?.url,
      responsivePosters: m.poster?.responsive,
      reviews: { ...reviews },
    };
  };

  const results = await Promise.all(movies.map(mapMovies));

  res.json({
    results,
  });
};
