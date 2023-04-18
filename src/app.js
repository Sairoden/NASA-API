const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");

const planetsRouter = require("./routes/planets/planetsRouter");
const launchesRouter = require("./routes/launches/launchesRouter");

const app = express();

// Implement CORS
app.use(cors());

app.options("*", cors());

// Middlewares
app.use(helmet());

app.use(morgan("dev"));
app.use(express.json());

// Serve public
app.use(express.static(path.join(__dirname, "..", "public")));

const checkLoggedIn = (req, res, next) => {
  const isLoggedIn = true;

  if (!isLoggedIn) return res.status(401).send({ error: "You must log in!" });

  next();
};

// Routers
app.use("/api/v1/planets", planetsRouter);
app.use("/api/v1/launches", launchesRouter);
app.all("*", (req, res, next) => {
  return res
    .status(200)
    .sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
