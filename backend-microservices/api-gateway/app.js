require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(morgan("dev"));

const services = {
  user: process.env.USER_SERVICE_URL || "http://user-service:8001",
  movie: process.env.MOVIE_SERVICE_URL || "http://movie-service:8002",
  review: process.env.REVIEW_SERVICE_URL || "http://review-service:8003",
  playlist: process.env.PLAYLIST_SERVICE_URL || "http://playlist-service:8004",
  admin: process.env.ADMIN_SERVICE_URL || "http://admin-service:8005",
  actor: process.env.ACTOR_SERVICE_URL || "http://actor-service:8006",
};

const isInternalEndpoint = (pathname) => {
  return pathname.includes("/internal/");
};

const createProxyOptions = (target) => ({
  target,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error(`Proxy error: ${err.message}`);
    res.status(503).json({
      error: "Service temporarily unavailable",
      service: req.path.split("/")[2],
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    if (proxyRes.statusCode >= 400) {
      console.error(
        `Proxy response error: ${proxyRes.statusCode} for ${req.path}`
      );
    }
  },
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API Gateway is running",
    services: Object.keys(services).reduce((acc, key) => {
      acc[key] = services[key];
      return acc;
    }, {}),
  });
});

app.use("/api", (req, res, next) => {
  if (isInternalEndpoint(req.path)) {
    return res.status(403).json({
      error: "This endpoint is not accessible through API Gateway",
      message:
        "Internal endpoints (/internal/*) are only available for service-to-service communication",
      path: req.originalUrl,
    });
  }
  next();
});

app.use(
  "/api/user",
  createProxyMiddleware({
    ...createProxyOptions(services.user),
    pathRewrite: (path) => `/api/user${path}`,
  })
);

app.use(
  "/api/movie",
  createProxyMiddleware({
    ...createProxyOptions(services.movie),
    pathRewrite: (path) => `/api/movie${path}`,
  })
);

app.use(
  "/api/review",
  createProxyMiddleware({
    ...createProxyOptions(services.review),
    pathRewrite: (path) => `/api/review${path}`,
  })
);

app.use(
  "/api/playlist",
  createProxyMiddleware({
    ...createProxyOptions(services.playlist),
    pathRewrite: (path) => `/api/playlist${path}`,
  })
);

app.use(
  "/api/admin",
  createProxyMiddleware({
    ...createProxyOptions(services.admin),
    pathRewrite: (path) => `/api/admin${path}`,
  })
);

app.use(
  "/api/actor",
  createProxyMiddleware({
    ...createProxyOptions(services.actor),
    pathRewrite: (path) => `/api/actor${path}`,
  })
);

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Gateway error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log("Proxying to services:");
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  - ${name}: ${url}`);
  });
});
