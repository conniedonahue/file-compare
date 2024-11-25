import { describe } from "vitest";
import { parsedFileCache } from "../../db/parsedFileCache.js";
import { parseController } from "../../server/controllers/parseController.js";
import { MissingFilesError } from "../../server/errors/errors.js";

vi.mock("../../db/parsedFileCache.js", () => ({
  parsedFileCache: {
    name: "mock",
    has: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  },
  createHash: vi.fn(() => "mockFileHash"),
}));

vi.spyOn(parseController, "parsePDF").mockResolvedValue("mocked parsed PDF");

afterEach(() => {
  vi.clearAllMocks();
});

describe("handleRequest", () => {
  test("should return error if requeust has less than 2 files", async () => {
    const oneFileRequest = {
      files: {
        file1: {
          buffer: Buffer.from("Mock content"),
          originalname: "mockContent.ts",
        },
      },
    };

    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const mockNext = vi.fn();

    await parseController.handleRequest(oneFileRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(MissingFilesError));
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});

describe("parseFile", () => {
  test("should cache parsed content and avoid re-parsing on cache hit", async () => {
    const mockFile = {
      buffer: Buffer.from("Test content"),
      originalname: "test.pdf",
    };

    // Mock cache behavior
    const mockFileHash = "mockFileHash";
    parsedFileCache.has.mockReturnValue(true);
    parsedFileCache.get.mockReturnValue("Mock content");

    // Expecting the parsed file content to be returned from the cache
    const result = await parseController.parseFile(mockFile);
    expect(result).toBe("Mock content");
    expect(parsedFileCache.has).toHaveBeenCalledWith(mockFileHash);
    expect(parsedFileCache.get).toHaveBeenCalledWith(mockFileHash);
  });

  test("should parse and cache new content on cache miss", async () => {
    const mockFile = {
      buffer: Buffer.from("New content"),
      originalname: "newfile.pdf",
    };

    // Simulate a cache miss
    const mockFileHash = "mockFileHash";
    parsedFileCache.has.mockReturnValue(false); // Simulate cache miss

    // Mock the parsing logic
    parsedFileCache.set.mockImplementation(() => {});
    console.log("parsePDF: ", await parseController.parsePDF());
    parseController.parsePDF.mockReturnValue("parsed content");

    const result = await parseController.parseFile(mockFile);

    // Expecting the parsed content to be returned and cached
    expect(result).toBe("parsed content");
    expect(parsedFileCache.set).toHaveBeenCalledWith(
      mockFileHash,
      "parsed content"
    );
  });

  test("should throw error for unsupported file types", async () => {
    const mockFile = {
      buffer: Buffer.from("Unsupported content"),
      originalname: "unsupported.exe",
    };

    // Expect an error to be thrown for unsupported file types
    await expect(parseController.parseFile(mockFile)).rejects.toThrow(
      "Unsupported file type: exe"
    );
  });
});
