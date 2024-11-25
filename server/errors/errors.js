export class UnsupportedFileTypeError extends Error {
  constructor(extension) {
    super(`Unsupported file type: ${extension}`);
    this.name = "UnsupportedFileTypeError";
    this.status = 400;
  }
}

export class MissingFilesError extends Error {
  constructor() {
    super("Two files must be uploaded.");
    this.name = "MissingFilesError";
    this.status = 400;
  }
}
