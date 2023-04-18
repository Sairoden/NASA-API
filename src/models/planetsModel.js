const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const mongoose = require("mongoose");

const planetSchema = new mongoose.Schema({
  keplerName: { type: String, required: true },
});

const Planet = mongoose.model("Planet", planetSchema);

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async data => {
        if (isHabitablePlanet(data)) savePlanets(data);
      })
      .on("error", err => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const planetCounts = await Planet.find().count();
        console.log(`${planetCounts} habitable planets found!`);
        resolve();
      });
  });
}

const savePlanets = async planet => {
  try {
    await Planet.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save planets ${err}`);
  }
};

module.exports = {
  loadPlanetsData,
  Planet,
};

