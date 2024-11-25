import * as pdfjsLib from "pdfjs-dist";
import { createHash, parsedFileCache } from "../../db/parsedFileCache.js";
import {
  MissingFilesError,
  UnsupportedFileTypeError,
} from "../errors/errors.js";

export const parseController = {};

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
    console.log("fileContents: ", req.fileContents);
    next();
  } catch (error) {
    console.error(`Error parsing files. ERROR: ${error}`);
    next(error);
    // res.status(500).json({ error: "Failed to parse files." });
  }
};

parseController.checkCache = (fileHash, originalname) => {
  if (parsedFileCache.has(fileHash)) {
    console.log(`Cache hit for file: ${originalname}`);
    return parsedFileCache.get(fileHash);
  } else {
    console.log(`Cache miss for file: ${originalname}`);
    return null;
  }
};

parseController.parseFile = async (file) => {
  const { buffer, originalname } = file;
  const fileHash = createHash(buffer);
  const cachedResult = parseController.checkCache(fileHash, originalname);
  if (cachedResult) return cachedResult;

  const ext = parseController.getFileExtension(originalname);

  let parsedContent;

  switch (ext) {
    case "pdf":
      parsedContent = await parseController.parsePDF(buffer);
      break;
    case "md":
    case "py":
    case "ts":
      parsedContent = buffer.toString("utf8");
      break;
    default:
      throw new UnsupportedFileTypeError(ext);
  }

  parsedFileCache.set(fileHash, parsedContent);
  return parsedContent;
};

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

parseController.getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};
