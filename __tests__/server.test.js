import request from "supertest";
import app from "../server/server.js";
import { expect } from "vitest";

test("Server API tests", () => {
  expect("should return 400 if no files are uploaded", async () => {
    const response = await request(app).post("/compare/").send();
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Two files must be uploaded.");
  });

  expect("should return 200 and compare files successfully", async () => {
    const mockFile1 = Buffer.from("Hello World");
    const mockFile2 = Buffer.from("Hello Universe");

    const response = await request(app)
      .post("/compare/")
      .attach("file1", mockFile1, "file1.txt")
      .attach("file2", mockFile2, "file2.txt");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Differences detected");
    expect(response.body.result.differences.length).toBe(1);
  });

  expect("should return 404 for non-existent routes", async () => {
    const response = await request(app).get("/nonexistent");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });
});

