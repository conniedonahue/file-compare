import { compareController } from "../../server/controllers/compareController.js";

describe("compareController", () => {
  it("should detect no differences for identical files", () => {
    const file1 = "Line1\nLine2\nLine3";
    const file2 = "Line1\nLine2\nLine3";

    const result = compareController.compareFiles(file1, file2);
    expect(result.isEqual).toBe(true);
    expect(result.differences).toHaveLength(0);
  });

  it("should detect differences in files", () => {
    const file1 = "Line1\nLine2";
    const file2 = "Line1\nLine3";

    const result = compareController.compareFiles(file1, file2);
    expect(result.isEqual).toBe(false);
    expect(result.differences).toHaveLength(1);
    expect(result.differences[0]).toEqual({
      line: 2,
      file1: "Line2",
      file2: "Line3",
    });
  });
});
