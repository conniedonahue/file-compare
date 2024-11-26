export const compareController = {};
/**
 * Handles the comparison of two parsed files.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.fileContents - Contains the parsed content of `file1` and `file2`.
 * @param {Object} res - Express response object.
 */

compareController.handleRequest = (req, res) => {
  const { file1, file2 } = req.fileContents;

  try {
    const result = compareController.compareFiles(file1, file2);
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

/**
 * Compares the content of two files line by line. If any of the two lines
 * are not strictly equal, the difference is pushed to the differences array.
 *
 * @param {string} file1 - Parsed content of the first file.
 * @param {string} file2 - Parsed content of the second file.
 * @returns {Object} Comparison result.
 * @returns {boolean} result.isEqual - Whether the files are equal.
 * @returns {Object[]} result.differences - Array of differences, with each item containing:
 *   - {number} line: The line number.
 *   - {string} file1: Content of the line in the first file.
 *   - {string} file2: Content of the line in the second file.
 */
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
