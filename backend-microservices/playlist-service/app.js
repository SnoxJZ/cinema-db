require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const { errorHandler } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();
require("./db");
const playlistRouter = require("./routes/playlist");
const { handleNotFound } = require("./utils/helper");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/playlist", playlistRouter);
app.use("/*", handleNotFound);

app.use(errorHandler);

const PORT = process.env.PORT || 8004;
app.listen(PORT, () => {
  console.log(`Playlist service running on port ${PORT}`);
});
