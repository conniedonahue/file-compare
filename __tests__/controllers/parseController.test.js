import { parseController } from "../../server/controllers/parseController.js";
import { expect, test } from "vitest";

test("parseController", () => {
  expect("should cache parsed content", async () => {
    const mockFile = {
      buffer: Buffer.from("Test content"),
      originalname: "test.txt",
    };

    const result = await parseController.parseFile(mockFile);
    expect(result).toBe("Test content");
    expect(parsedFileCache.get("mockedHash")).toBe("Test content");
  });

  expect("should detect unsupported file types", async () => {
    const mockFile = {
      buffer: Buffer.from("Unsupported content"),
      originalname: "unsupported.exe",
    };

    await expect(parseController.parseFile(mockFile)).rejects.toThrow(
      "Unsupported file type: exe"
    );
  });
});
