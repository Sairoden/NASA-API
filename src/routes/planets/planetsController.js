const { Planet } = require("../../models/planetsModel");

exports.getAllPlanets = async (req, res) => {
  const planets = await Planet.find();
  // .select("keplerName -_id");
  return res.status(200).send(planets);
};
