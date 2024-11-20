import * as pdfjsLib from "pdfjs-dist";

export const fileParseController = {};

fileParseController.handleRequest = async (req, res, next) => {
  console.log("in controller");
  const file1 = req.files?.file1?.[0];
  const file2 = req.files?.file2?.[0];
  console.log("file1: ", file1, "\n file2: ", file2);

  if (!file1 || !file2) {
    return res.status(400).json({
      error: `Two files must be uploaded.}`,
    });
  }

  try {
    const parsedContent = await Promise.all([
      fileParseController.parseFile(file1),
      fileParseController.parseFile(file2),
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

fileParseController.parseFile = async (file) => {
  const ext = fileParseController.getFileExtension(file.originalname);

  switch (ext) {
    case "pdf":
      return await fileParseController.parsePDF(file);
    case "md":
    case "py":
    case "ts":
      return file.buffer.toString("utf8");
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

fileParseController.parsePDF = async (pdfFile) => {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdfDocument = await loadingTask.promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    console.log("textContent: ", textContent);

    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
};

fileParseController.getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};
