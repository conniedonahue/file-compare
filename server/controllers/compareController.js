export const compareController = {};

compareController.handleRequest = (req, res) => {
  const { file1, file2 } = req.fileContents;

  try {
    const result = compareController.compareFiles(file1, file2);
    //store result;
    res.status(200).json({
      message: result.isEqual
        ? "No differences detected"
        : "Differences detected",
      result,
    });
  } catch (error) {
    console.error("Error comparing files:", error);
    res.status(500).json({ error: "Failed to compare files" });
  }
};

compareController.compareFiles = (file1, file2) => {
  if (file1 === file2) {
    return { isEqual: true, differences: [] };
  }

  const differences = [];
  const file1Lines = file1.split("\n");
  const file2Lines = file2.split("\n");
  const maxLen = Math.max(file1Lines.length, file2Lines.length);

  for (let i = 0; i < maxLen; i++) {
    const line1 = file1Lines[i] || "";
    const line2 = file2Lines[i] || "";

    if (line1 !== line2) {
      differences.push({
        line: i + 1,
        file1: line1,
        file2: line2,
      });
    }
  }

  return { isEqual: false, differences: differences };
};
