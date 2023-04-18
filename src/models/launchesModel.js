const mongoose = require("mongoose");
const axios = require("axios");
const { Planet } = require("../models/planetsModel");

const launchesSchema = new mongoose.Schema({
  flightNumber: { type: Number, required: true },
  launchDate: { type: Date, required: true },
  mission: { type: String, required: true, minLength: 3, maxLength: 255 },
  rocket: { type: String, required: true, minLength: 3, maxLength: 255 },
  target: { type: String, minLength: 3, maxLength: 255 },
  customers: {
    type: [String],
    required: true,
    default: ["ZTM", "NASA"],
  },
  upcoming: { type: Boolean, required: true, default: true },
  success: { type: Boolean, required: true, default: true },
});

const Launch = mongoose.model("Launch", launchesSchema);

const findLaunch = async filter => await Launch.findOne(filter);

const populateLaunches = async () => {
  console.log("Downloading launch data...");

  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap(payload => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
};

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

const loadLaunchData = async () => {
  try {
    const firstLaunch = await findLaunch({
      flightNumber: 1,
      rocket: "Falcon 1",
      mission: "FalconSat",
    });

    if (firstLaunch) {
        console.log("Launch data already loaded");
    } else {
      await populateLaunches();
    }
  } catch (err) {
    console.log(err.message);
  }
};

const saveLaunch = async launch => {
  try {
    await Launch.findOneAndUpdate(
      {
        flightNumber: launch.flightNumber,
      },
      launch,
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  Launch,
  loadLaunchData,
};
