import * as pdfjsLib from "pdfjs-dist";
import { parseController } from "server/controllers/parseController.js";
import { parsedFileCache } from "db/parsedFileCache.js";

jest.mock("pdfjs-dist", () => ({
  getDocument: jest.fn(),
}));
jest.mock("../../db/parsedFileCache");

describe("parseController", () => {
  afterEach(() => {
    jest.clearAllMocks();
    parsedFileCache.clear();
  });

  test("handles request with missing files", async () => {
    const req = { body: { files: {} } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await parseController.handleRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Two files must be uploaded.",
    });
  });

  test("parses and caches a new PDF file", async () => {
    const mockPdfBuffer = Buffer.from("fake-pdf-content");
    const req = {
      body: {
        file1: { buffer: mockPdfBuffer, originalname: "file1.pdf" },
        file2: { buffer: mockPdfBuffer, originalname: "file2.pdf" },
      },
    };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    pdfjsLib.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: jest.fn().mockResolvedValue({
          getTextContent: jest.fn().mockResolvedValue({
            items: [{ transform: [0, 0, 0, 0, 0, 10], str: "Line 1" }],
          }),
        }),
      }),
    });

    await parseController.handleRequest(req, res, next);

    expect(parsedFileCache.set).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test("returns cached result for existing files", async () => {
    const mockPdfBuffer = Buffer.from("cached-content");
    const fileHash = "mockhash";

    parsedFileCache.has.mockReturnValue(true);
    parsedFileCache.get.mockReturnValue("Cached Content");

    const result = await parseController.parseFile({
      buffer: mockPdfBuffer,
      originalname: "file1.pdf",
    });

    expect(parsedFileCache.has).toHaveBeenCalledWith(fileHash);
    expect(result).toBe("Cached Content");
  });
});
