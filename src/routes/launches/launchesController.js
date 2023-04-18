const { Launch } = require("../../models/launchesModel");
const { Planet } = require("../../models/planetsModel");

const DEFAULT_FLIGHT_NUMBER = 100;

const getLatestFlightNumber = async () => {
  const latestLaunch = await Launch.findOne().sort("-flightNumber");

  if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;

  return latestLaunch.flightNumber;
};

exports.getAllLaunches = async (req, res) => {
  try {
    const page = Math.abs(req.query.page) || 1;
    const limit = Math.abs(req.query.limit) || 0;
    const skip = (page - 1) * limit;

    const launches = await Launch.find()
      .select("-_id -__v")
      .skip(skip)
      .limit(limit)
      .sort({ flightNumber: 1 });
    return res.status(200).send(launches);
  } catch (err) {
    return res.status(400).send({
      name: "Can't get all launches",
      error: err.message,
    });
  }
};

exports.createLaunch = async (req, res) => {
  try {
    let launch = req.body;

    if (
      !launch.mission ||
      !launch.rocket ||
      !launch.launchDate ||
      !launch.target
    )
      return res.status(400).send({
        error: "Missing required launch property",
      });

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate))
      return res.status(400).send({ error: "Invalid launch date" });

    const planet = await Planet.findOne({ keplerName: launch.target });

    if (!planet) throw new Error("No matching planet was found");

    const newFlightNumber = (await getLatestFlightNumber()) + 1;

    console.log(launch.target);

    const newLaunch = await Launch.create({
      flightNumber: newFlightNumber,
      mission: launch.mission,
      rocket: launch.rocket,
      launchDate: launch.launchDate,
      target: launch.target,
    });

    return res.status(201).send(newLaunch);
  } catch (err) {
    return res.status(400).send({
      name: "Launch not created",
      error: err.message,
    });
  }
};

exports.deleteLaunch = async (req, res) => {
  try {
    let { id } = req.params;
    id = Number(id);

    const abortedLaunch = await Launch.findOneAndUpdate(
      { flightNumber: id },
      {
        upcoming: false,
        success: false,
      }
    );

    if (!abortedLaunch)
      return res.status(404).send({ error: "Launch not found" });

    return res.status(200).send(abortedLaunch);
  } catch (err) {
    return res.status(404).send({
      name: "Launch  not aborted",
      error: err.message,
    });
  }
};
