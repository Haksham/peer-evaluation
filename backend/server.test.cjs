const request = require("supertest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./server.js");

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const Host = require("./models/host.js");
  await Host.deleteOne({ roomId: "testrm123" });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("API Endpoints", () => {
  let testRoomId = "testrm123";
  let testHost = { hostName: "TestHost", hostId: "host123", roomId: testRoomId };
  let testClient = {
    name: "TestClient",
    usn: "client123",
    title: "Test Title",
    abstract: "Test Abstract",
    timeslot: 10,
    pdf: "http://example.com/test.pdf",
    githubLink: "http://github.com/test",
    roomId: testRoomId
  };

  it("should create a host", async () => {
    const res = await request(app)
      .post("/api/host/create-host")
      .send(testHost)
      .set("Accept", "application/json");
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.roomId).toBe(testRoomId);
  });

  it("should create a client", async () => {
    // Clean up any existing client with the same usn
    const Client = require("./models/client.js");
    await Client.deleteOne({ usn: testClient.usn });

    const res = await request(app)
      .post("/api/client/create-client")
      .send(testClient)
      .set("Accept", "application/json");
    if (res.statusCode !== 201) {
      console.log("Create client error:", res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Client added to room");
  });

  it("should login a client", async () => {
    const res = await request(app)
      .post("/api/client/login")
      .send({ name: testClient.name, usn: testClient.usn, roomId: testRoomId })
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(200);
    expect(res.body.roomId).toBe(testRoomId);
  });

  it("should get client list", async () => {
    const res = await request(app)
      .get(`/api/client/list?roomId=${testRoomId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.clients)).toBe(true);
  });

  it("should submit a review", async () => {
    const review = {
      roomId: testRoomId,
      reviewedClientUsn: testClient.usn,
      reviewerName: testHost.hostName,
      reviewerRole: "host",
      rating: 8,
      comment: "Great job!"
    };
    const res = await request(app)
      .post("/api/review/submit")
      .send(review)
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should get all reviews for a room", async () => {
    const res = await request(app)
      .get(`/api/review/all?roomId=${testRoomId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.reviews)).toBe(true);
  });
});