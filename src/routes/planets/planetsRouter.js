const express = require("express");
const { getAllPlanets } = require("./planetsController");

const router = express.Router();

router.route("/").get(getAllPlanets);

module.exports = router;
