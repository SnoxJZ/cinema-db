const Playlist = require("../models/playlist");
const { isValidObjectId } = require("mongoose");
const { sendError } = require("../utils/helper");
const { movieClient } = require("../clients/movieClient");

exports.createPlaylist = async (req, res) => {
  const { name, description, isPublic } = req.body;
  const userId = req.user._id;

  const playlist = new Playlist({
    name,
    description,
    owner: userId,
    isPublic: isPublic || false,
  });

  await playlist.save();

  res.json({
    playlist: {
      id: playlist._id,
      name: playlist.name,
      isPublic: playlist.isPublic,
    },
  });
};

exports.addMovieToPlaylist = async (req, res) => {
  const { playlistId, movieId } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(movieId))
    return sendError(res, "Invalid ID!");

  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
  if (!playlist) return sendError(res, "Playlist not found!");

  if (playlist.movies.includes(movieId))
    return sendError(res, "Movie already in playlist!");

  playlist.movies.push(movieId);
  await playlist.save();

  res.json({ message: "Movie added to playlist!" });
};

exports.removeMovieFromPlaylist = async (req, res) => {
  const { playlistId, movieId } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(movieId))
    return sendError(res, "Invalid ID!");

  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
  if (!playlist) return sendError(res, "Playlist not found!");

  playlist.movies = playlist.movies.filter((m) => m.toString() !== movieId);
  await playlist.save();

  res.json({ message: "Movie removed from playlist!" });
};

exports.getPlaylists = async (req, res) => {
  const userId = req.user._id;

  const playlists = await Playlist.find({ owner: userId }).select(
    "name isPublic"
  );

  const formattedPlaylists = playlists.map((p) => ({
    id: p._id,
    name: p.name,
    isPublic: p.isPublic,
  }));

  res.json({ playlists: formattedPlaylists });
};

exports.deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId)) return sendError(res, "Invalid ID!");

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: userId,
  });

  if (!playlist) return sendError(res, "Playlist not found!");

  res.json({ message: "Playlist deleted!" });
};

exports.getPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId)) return sendError(res, "Invalid ID!");

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: userId,
  });

  if (!playlist) return sendError(res, "Playlist not found!");

  const movieIds = playlist.movies.map((m) => m.toString());

  if (movieIds.length === 0) {
    return res.json({
      playlist: {
        id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.isPublic,
        movies: [],
      },
    });
  }

  const { data: movies } = await movieClient.post("/movie/internal/batch", {
    ids: movieIds,
  });
  const movieMap = movies.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});

  res.json({
    playlist: {
      id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic,
      movies: movieIds
        .map((id) => {
          const m = movieMap[id];
          if (!m) return null;
          return {
            id: m.id,
            title: m.title,
            poster: m.poster?.url,
            responsivePosters: m.poster?.responsive,
            genres: m.genres,
            reviews: {
              ratingAvg: m.reviewStats?.ratingAvg,
              reviewCount: m.reviewStats?.reviewCount,
            },
          };
        })
        .filter(Boolean),
    },
  });
};
