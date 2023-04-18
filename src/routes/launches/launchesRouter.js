const express = require("express");
const {
  getAllLaunches,
  createLaunch,
  deleteLaunch,
} = require("./launchesController");

const router = express.Router();

router.route("/").get(getAllLaunches).post(createLaunch);
router.route("/:id").delete(deleteLaunch);

module.exports = router;
