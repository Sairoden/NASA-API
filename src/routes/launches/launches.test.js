const request = require("supertest");
const app = require("../../app");

describe("GET /launches", () => {
  it("Should respond with 200 success", async () => {
    const res = await request(app).get("/launches").expect(200);
  });
});

describe("POST /launches", () => {
  const completeLaunchData = {
    mission: "USSR",
    rocket: "Houston",
    target: "Hitler",
    launchDate: "January 5, 2024",
  };

  const launchDataWithoutDate = {
    mission: "USSR",
    rocket: "Houston",
    target: "Hitler",
  };

  it("Should respond with 201 created", async () => {
    const res = await request(app)
      .post("/launches")
      .send(completeLaunchData)
      .expect(201);
  });
});
