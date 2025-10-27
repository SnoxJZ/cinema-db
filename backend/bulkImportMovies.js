const { sendError } = require("./utils/helper");
const Movie = require("./models/movie");
const Review = require("./models/review");
const Actor = require("./models/actor");
const User = require("./models/user");

exports.bulkImportMovies = async (req, res) => {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const {
    totalPages = 25,
    category = "popular",
    mediaType = "movie",
  } = req.body;

  try {
    let totalImported = 0;
    let totalSkipped = 0;
    const startTime = Date.now();

    for (let page = 1; page <= totalPages; page++) {
      const endpoint =
        mediaType === "tv"
          ? `https://api.themoviedb.org/3/tv/${category}`
          : `https://api.themoviedb.org/3/movie/${category}`;

      const listResponse = await fetch(
        `${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
      );
      const listData = await listResponse.json();

      for (const tmdbMovie of listData.results) {
        const title = mediaType === "tv" ? tmdbMovie.name : tmdbMovie.title;

        const exists = await Movie.findOne({
          $or: [{ title }, { apiId: tmdbMovie.id }],
        });
        if (exists) {
          totalSkipped++;
          continue;
        }

        const detailEndpoint =
          mediaType === "tv"
            ? `https://api.themoviedb.org/3/tv/${tmdbMovie.id}`
            : `https://api.themoviedb.org/3/movie/${tmdbMovie.id}`;
        const detailResponse = await fetch(
          `${detailEndpoint}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,reviews,keywords`
        );
        const detail = await detailResponse.json();

        const genres = detail.genres.map((g) => g.name);

        let directorId = null;
        if (mediaType === "tv") {
          const creatorData = detail.created_by?.[0];
          if (creatorData) {
            let director = await Actor.findOne({
              $or: [{ name: creatorData.name }, { apiId: creatorData.id }],
            });
            if (!director) {
              director = await Actor.create({
                apiId: creatorData.id,
                name: creatorData.name,
                about: "",
                gender: creatorData.gender === 1 ? "female" : "male",
                avatar: creatorData.profile_path
                  ? {
                      url: `https://image.tmdb.org/t/p/w200${creatorData.profile_path}`,
                      public_id: `tmdb_creator_${creatorData.id}`,
                    }
                  : undefined,
              });
            }
            directorId = director._id;
          }

          if (!directorId) {
            const directorData = detail.credits?.crew?.find(
              (c) => c.known_for_department === "Directing"
            );
            if (directorData) {
              let director = await Actor.findOne({
                $or: [{ name: directorData.name }, { apiId: directorData.id }],
              });
              if (!director) {
                director = await Actor.create({
                  apiId: directorData.id,
                  name: directorData.name,
                  about: "",
                  gender: directorData.gender === 1 ? "female" : "male",
                  avatar: directorData.profile_path
                    ? {
                        url: `https://image.tmdb.org/t/p/w200${directorData.profile_path}`,
                        public_id: `tmdb_director_${directorData.id}`,
                      }
                    : undefined,
                });
              }
              directorId = director._id;
            }
          }
        } else {
          const directorData = detail.credits?.crew?.find(
            (c) => c.job === "Director"
          );
          if (directorData) {
            let director = await Actor.findOne({
              $or: [{ name: directorData.name }, { apiId: directorData.id }],
            });
            if (!director) {
              director = await Actor.create({
                apiId: directorData.id,
                name: directorData.name,
                about: "",
                gender: directorData.gender === 1 ? "female" : "male",
                avatar: directorData.profile_path
                  ? {
                      url: `https://image.tmdb.org/t/p/w200${directorData.profile_path}`,
                      public_id: `tmdb_director_${directorData.id}`,
                    }
                  : undefined,
              });
            }
            directorId = director._id;
          }
        }

        if (!directorId) {
          let unknownDirector = await Actor.findOne({
            name: "Unknown Director",
          });
          if (!unknownDirector) {
            unknownDirector = await Actor.create({
              name: "Unknown Director",
              about: "Director information not available",
              gender: "male",
            });
          }
          directorId = unknownDirector._id;
        }

        const producers =
          detail.credits?.crew
            ?.filter(
              (c) =>
                c.job === "Producer" ||
                c.job === "Executive Producer" ||
                c.known_for_department === "Production"
            )
            .slice(0, 5) || [];
        const producerIds = [];
        for (const producerData of producers) {
          let producer = await Actor.findOne({
            $or: [{ name: producerData.name }, { apiId: producerData.id }],
          });
          if (!producer) {
            producer = await Actor.create({
              apiId: producerData.id,
              name: producerData.name,
              about: "",
              gender: producerData.gender === 1 ? "female" : "male",
              avatar: producerData.profile_path
                ? {
                    url: `https://image.tmdb.org/t/p/w200${producerData.profile_path}`,
                    public_id: `tmdb_producer_${producerData.id}`,
                  }
                : undefined,
            });
          }
          producerIds.push(producer._id);
        }

        const writers =
          detail.credits?.crew
            ?.filter(
              (c) =>
                c.job === "Writer" ||
                c.job === "Screenplay" ||
                c.known_for_department === "Writing"
            )
            .slice(0, 5) || [];
        const writerIds = [];
        for (const writerData of writers) {
          let writer = await Actor.findOne({
            $or: [{ name: writerData.name }, { apiId: writerData.id }],
          });
          if (!writer) {
            writer = await Actor.create({
              apiId: writerData.id,
              name: writerData.name,
              about: "",
              gender: writerData.gender === 1 ? "female" : "male",
              avatar: writerData.profile_path
                ? {
                    url: `https://image.tmdb.org/t/p/w200${writerData.profile_path}`,
                    public_id: `tmdb_writer_${writerData.id}`,
                  }
                : undefined,
            });
          }
          writerIds.push(writer._id);
        }

        const cast = [];
        for (const person of detail.credits.cast.slice(0, 10)) {
          let actor = await Actor.findOne({ name: person.name });
          if (!actor) {
            actor = await Actor.create({
              apiId: person.id,
              name: person.name,
              about: person.character,
              gender: person.gender === 1 ? "female" : "male",
              avatar: person.profile_path
                ? {
                    url: `https://image.tmdb.org/t/p/w200${person.profile_path}`,
                    public_id: `tmdb_actor_${person.id}`,
                  }
                : undefined,
            });
          }
          cast.push({
            actor: actor._id,
            roleAs: person.character,
            leadActor: person.order < 3,
          });
        }

        const trailerData = detail.videos.results.find(
          (v) => v.type === "Trailer"
        );
        const trailer = trailerData
          ? {
              url: `https://www.youtube.com/watch?v=${trailerData.key}`,
              public_id: `tmdb_trailer_${tmdbMovie.id}`,
            }
          : {
              url: "https://placeholder.com/trailer.mp4",
              public_id: `trailer_placeholder_${tmdbMovie.id}`,
            };

        let type = "Movie";
        if (mediaType === "tv") {
          if (detail.type === "Documentary") {
            type = "Documentary";
          } else if (detail.type === "Scripted") {
            type = "TV Series";
          } else if (detail.type === "Miniseries") {
            type = "Web Series";
          } else {
            type = "TV Series";
          }
        } else {
          const isDocumentary = detail.genres.some((g) => g.id === 99);
          type = isDocumentary ? "Documentary" : "Movie";
        }

        const releaseDate =
          mediaType === "tv" ? detail.first_air_date : detail.release_date;

        const tags =
          mediaType === "tv"
            ? detail.keywords?.results?.map((k) => k.name).slice(0, 7)
            : detail.keywords?.keywords?.map((k) => k.name).slice(0, 7);

        if (!releaseDate) {
          totalSkipped++;
          continue;
        }

        const movie = new Movie({
          apiId: detail.id,
          title: mediaType === "tv" ? detail.name : detail.title,
          storyLine: detail.overview || "No description available",
          releseDate: new Date(releaseDate),
          status: "public",
          type,
          genres,
          tags: tags || [],
          language: detail.original_language,
          director: directorId,
          producers: producerIds,
          writers: writerIds,
          cast,
          poster: {
            url: `https://image.tmdb.org/t/p/w500${detail.poster_path}`,
            public_id: `tmdb_${tmdbMovie.id}`,
            responsive: [],
          },
          trailer,
        });

        await movie.save();

        // Отзывы
        const reviewIds = [];
        for (const tmdbReview of detail.reviews.results.slice(0, 10)) {
          let user = await User.findOne({ name: tmdbReview.author });
          if (!user) {
            user = await User.create({
              name: tmdbReview.author,
              email: `${tmdbReview.author_details.username}@gmail.com`,
              password: "imported_user",
              isVerified: true,
              role: "user",
            });
          }

          const review = await Review.create({
            owner: user._id,
            parentMovie: movie._id,
            content: tmdbReview.content,
            rating: tmdbReview.author_details.rating
              ? Math.round(tmdbReview.author_details.rating)
              : 5,
            isSpoiler: false,
          });

          reviewIds.push(review._id);
        }

        if (reviewIds.length) {
          movie.reviews = reviewIds;

          const reviews = await Review.find({ _id: { $in: reviewIds } });
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const ratingAvg = parseFloat(
            (totalRating / reviews.length).toFixed(1)
          );

          movie.reviews = reviewIds;
          movie.reviewStats = {
            ratingAvg: Number(ratingAvg),
            reviewCount: Number(reviewIds.length),
          };

          await movie.save();
        }

        totalImported++;
        const elapsed = (Date.now() - startTime) / 1000;
        const avgTimePerMovie = elapsed / totalImported;
        const remaining = (totalPages * 20 - totalImported) * avgTimePerMovie;

        console.log(
          `Imported: ${totalImported}/${
            totalPages * 20
          } | Page: ${page}/${totalPages} | Remaining: ~${Math.round(
            remaining / 60
          )} min`
        );

        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    res.json({
      success: true,
      imported: totalImported,
      skipped: totalSkipped,
      pages: totalPages,
    });
  } catch (error) {
    sendError(res, error.message);
  }
};
