require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const { errorHandler } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();
require("./db");
const movieRouter = require("./routes/movie");
const { handleNotFound } = require("./utils/helper");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/movie", movieRouter);
app.use("/*", handleNotFound);

app.use(errorHandler);

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`Movie service running on port ${PORT}`);
});
