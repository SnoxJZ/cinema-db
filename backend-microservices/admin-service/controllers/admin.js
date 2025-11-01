const { userClient } = require("../clients/userClient");
const { movieClient } = require("../clients/movieClient");
const { reviewClient } = require("../clients/reviewClient");
const { actorClient } = require("../clients/actorClient");

exports.getAppInfo = async (req, res) => {
  try {
    const {
      data: { count: movieCount },
    } = await movieClient.get("/movie/internal/count");

    const {
      data: { count: reviewCount },
    } = await reviewClient.get("/review/internal/count");

    const {
      data: { count: userCount },
    } = await userClient.get("/user/internal/count");

    res.json({
      appInfo: { movieCount, reviewCount, userCount },
    });
  } catch (err) {
    console.error("Error in getAppInfo:", err.response?.data || err.message);
    return res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
};

exports.getMostRated = async (req, res) => {
  const { data } = await movieClient.get("/movie/top-rated");

  res.json({ movies: data.movies });
};

exports.getActivityLogs = async (req, res) => {
  const { page = 1, limit = 50, userId, action } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const params = {
    limit: limitNum * 2,
  };
  if (userId) params.userId = userId;
  if (action) params.action = action;

  const [userLogs, movieLogs, reviewLogs, actorLogs] = await Promise.all([
    userClient
      .get("/user/internal/activity-logs", { params })
      .then((r) => r.data)
      .catch((err) => {
        console.error(
          "Error fetching user logs:",
          err.response?.data || err.message
        );
        return [];
      }),
    movieClient
      .get("/movie/internal/activity-logs", { params })
      .then((r) => r.data)
      .catch((err) => {
        console.error(
          "Error fetching movie logs:",
          err.response?.data || err.message
        );
        return [];
      }),
    reviewClient
      .get("/review/internal/activity-logs", { params })
      .then((r) => r.data)
      .catch((err) => {
        console.error(
          "Error fetching review logs:",
          err.response?.data || err.message
        );
        return [];
      }),
    actorClient
      .get("/actor/internal/activity-logs", { params })
      .then((r) => r.data)
      .catch((err) => {
        console.error(
          "Error fetching actor logs:",
          err.response?.data || err.message
        );
        return [];
      }),
  ]);

  const allLogs = [...userLogs, ...movieLogs, ...reviewLogs, ...actorLogs];

  allLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedLogs = allLogs.slice(startIndex, endIndex);

  const userIds = [
    ...new Set(paginatedLogs.map((log) => log.user).filter(Boolean)),
  ];
  const { data: users } = await userClient.post("/user/internal/batch", {
    ids: userIds,
  });
  const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

  const formattedLogs = paginatedLogs.map((log) => ({
    ...log,
    user: log.user
      ? {
          id: userMap[log.user]?.id,
          name: userMap[log.user]?.name,
          email: userMap[log.user]?.email,
        }
      : null,
  }));

  res.json({
    logs: formattedLogs,
    totalPages: Math.ceil(allLogs.length / limitNum),
    currentPage: pageNum,
  });
};
