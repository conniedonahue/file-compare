import * as pdfjsLib from "pdfjs-dist";

export const parseController = {};

parseController.handleRequest = async (req, res, next) => {
  const file1 = req.files?.file1?.[0];
  const file2 = req.files?.file2?.[0];

  if (!file1 || !file2) {
    return res.status(400).json({
      error: `Two files must be uploaded.}`,
    });
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
    res.status(500).json({ error: "Failed to parse files." });
  }
};

parseController.parseFile = async (file) => {
  const ext = parseController.getFileExtension(file.originalname);

  switch (ext) {
    case "pdf":
      return await parseController.parsePDF(file);
    case "md":
    case "py":
    case "ts":
      return file.buffer.toString("utf8");
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

parseController.parsePDF = async (pdfFile) => {
  const uint8ArrayData = new Uint8Array(pdfFile.buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8ArrayData });
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
};

parseController.getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};
