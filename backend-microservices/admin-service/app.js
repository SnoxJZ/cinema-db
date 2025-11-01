require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const { errorHandler } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();
require("./db");
const adminRouter = require("./routes/admin");
const { handleNotFound } = require("./utils/helper");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/admin", adminRouter);
app.use("/*", handleNotFound);

app.use(errorHandler);

const PORT = process.env.PORT || 8005;
app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});
