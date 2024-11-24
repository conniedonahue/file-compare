export class UnsupportedFileTypeError extends Error {
  constructor(extension) {
    super(`Unsupported file type: ${extension}`);
    this.name = "UnsupportedFileTypeError";
    this.status = 400;
  }
}
