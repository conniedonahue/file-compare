import { parsedFileCache } from "../../db/parsedFileCache.js";
import { parseController } from "../../server/controllers/parseController.js";
import { mockCache, createHash } from "../__mocks__/mockCache.js";

vi.mock("../../db/parsedFileCache.js", () => ({
  parsedFileCache: {
    has: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  },
  createHash: vi.fn(() => "mockFileHash"),
}));

vi.mock(
  import("../../server/controllers/parseController.js"),
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      parsePDF: vi.fn(async () => {
        console.log("mocked parsePDF called!");
        return "parsed content";
      }),
      checkCache: vi.fn((fileHash, originalname) => {
        if (parsedFileCache.has(fileHash)) {
          console.log(`Mocked Cache hit for file: ${originalname}`);
          return parsedFileCache.get(fileHash);
        } else {
          console.log(`Mocked Cache miss for file: ${originalname}`);
          return null;
        }
      }),
    };
  }
);

afterEach(() => {
  vi.clearAllMocks();
});

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

  mockResponse.status(400).json({ error: "Test error message" });

  await parseController.handleRequest(oneFileRequest, mockResponse);
  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    error: "Two files must be uploaded.",
  });
});

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
  const mockFileHash = "mockedNewHash";
  parsedFileCache.has.mockReturnValue(false); // Simulate cache miss

  // Mock the parsing logic
  parsedFileCache.set.mockImplementation(() => {});
  parseController.parsePDF.mockResolvedValue("parsed content");

  const result = await parseController.parseFile(mockFile);

  // Expecting the parsed content to be returned and cached
  expect(result).toBe("New content");
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
