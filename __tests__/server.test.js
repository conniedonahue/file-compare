import request from "supertest";
import app from "../server/server.js";
import { expect } from "vitest";
import FileExtensions from "../constants/validFileExtensions.js";

describe("Server API tests", () => {
  test("should return 400 if no files are uploaded", async () => {
    const response = await request(app).post("/compare/").send();
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Two files must be uploaded.");
  });

  test("should return 400 if unsupported file types are uploaded", async () => {
    const mockFile1 = Buffer.from("Hello World");
    const mockFile2 = Buffer.from("Hello Universe");

    // Simulating unsupported file type
    const response = await request(app)
      .post("/compare/")
      .attach("file1", mockFile1, "file1.txt")
      .attach("file2", mockFile2, "file2.txt");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `Unsupported file type: txt. List of acceptable file extensions: ${FileExtensions.getFormattedList()}`
    );
  });

  test("should return 200 and compare files successfully", async () => {
    const mockFile1 = Buffer.from("Hello World");
    const mockFile2 = Buffer.from("Hello Universe");

    const response = await request(app)
      .post("/compare/")
      .attach("file1", mockFile1, "file1.ts")
      .attach("file2", mockFile2, "file2.ts");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Differences detected");
    expect(response.body.result.differences.length).toBe(1);
  });

  test("should return 404 for non-existent routes", async () => {
    const response = await request(app).get("/nonexistent");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });
});
