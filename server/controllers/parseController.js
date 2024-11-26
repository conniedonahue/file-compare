import * as pdfjsLib from "pdfjs-dist";
import FileExtensions from "../../constants/validFileExtensions.js";
import { createHash, parsedFileCache } from "../../db/parsedFileCache.js";
import {
  MissingFilesError,
  UnsupportedFileTypeError,
} from "../errors/errors.js";

export const parseController = {};

/**
 * Handles parsing of uploaded files.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express middleware next function.
 *
 * @throws {MissingFilesError} If one or both files are missing.
 */

parseController.handleRequest = async (req, res, next) => {
  const file1 = req.files?.file1?.[0];
  const file2 = req.files?.file2?.[0];

  if (!file1 || !file2) {
    return next(new MissingFilesError());
  }

  try {
    const parsedContent = await Promise.all([
      parseController.parseFile(file1),
      parseController.parseFile(file2),
    ]);
    req.fileContents = {
      file1: parsedContent[0],
      file2: parsedContent[1],
    };
    next();
  } catch (error) {
    console.error(`Error parsing files. ERROR: ${error}`);
    next(error);
  }
};

/**
 * Checks if a file's parsed content is cached.
 *
 * @param {string} fileHash - Hash of the file contents.
 * @param {string} originalname - Original name of the file.
 * @returns {string|null} Cached parsed content, or `null` if not in cache.
 */

parseController.checkCache = (fileHash, originalname) => {
  if (parsedFileCache.has(fileHash)) {
    console.log(`Cache hit for file: ${originalname}`);
    return parsedFileCache.get(fileHash);
  } else {
    console.log(`Cache miss for file: ${originalname}`);
    return null;
  }
};

/**
 * Parses a file and caches the result if not already cached.
 *
 * @param {Object} file - The uploaded file.
 * @param {Buffer} file.buffer - File content as a buffer.
 * @param {string} file.originalname - Original name of the file.
 * @returns {string} Parsed file content.
 * @throws {UnsupportedFileTypeError} If the file type is unsupported.
 */

parseController.parseFile = async (file) => {
  const { buffer, originalname } = file;
  const fileHash = createHash(buffer);
  const cachedResult = parseController.checkCache(fileHash, originalname);
  if (cachedResult) return cachedResult;

  const ext = parseController.getFileExtension(originalname);
  const category = parseController.getFileCategory(ext);

  let parsedContent;

  switch (category) {
    case "PDF":
      parsedContent = await parseController.parsePDF(buffer);
      break;
    case "TEXT_BASED":
      parsedContent = buffer.toString("utf8");
      break;
    case "UNSUPPORTED":
    default:
      throw new UnsupportedFileTypeError(ext);
  }

  parsedFileCache.set(fileHash, parsedContent);
  return parsedContent;
};

/**
 * Extracts text content from a PDF buffer using pdfjs.
 * Pdf is processed in chunks (pages).
 *
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {string} Parsed text content of the PDF with new lines delineated by '\n'
 * @throws {Error} If text extraction fails.
 */
parseController.parsePDF = async (buffer) => {
  const uint8ArrayData = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8ArrayData });

  try {
    const pdfDocument = await loadingTask.promise;
    const lines = [];
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      const lineMap = new Map();
      textContent.items.forEach((item) => {
        const y = item.transform[5];
        const text = item.str;
        const line = lineMap.get(y) ?? lineMap.set(y, []).get(y);
        line.push(text);
      });

      const sortedLines = Array.from(lineMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, texts]) => texts.join(" "));

      lines.push(...sortedLines);
    }

    const fullText = lines.join("\n");

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF: ", error);
    throw new Error("Failed to extract text from PDF.");
  }
};

/**
 * Extracts the file extension from a filename.
 *
 * @param {string} filename - The name of the file.
 * @returns {string} The file extension in lowercase ('ts', 'pdf', etc).
 */

parseController.getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};

/**
 * Categorizes a file based on its extension. Determines parsing method.
 *
 * @param {string} ext - The file extension.
 * @returns {string} The category of the file (`PDF`, `TEXT_BASED`, or `UNSUPPORTED`).
 */
parseController.getFileCategory = (ext) => {
  let category;

  if (ext === FileExtensions.PDF) {
    category = "PDF";
  } else if (FileExtensions.TEXT_BASED.has(ext)) {
    category = "TEXT_BASED";
  } else {
    category = "UNSUPPORTED";
  }

  return category;
};
