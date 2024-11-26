import FileExtensions from "../../constants/validFileExtensions.js";
import { MAX_FILE_SIZE } from "../../constants/maxFileSize.js";

export class UnsupportedFileTypeError extends Error {
  constructor(extension) {
    super(
      `Unsupported file type: ${extension}. List of acceptable file extensions: ${FileExtensions.getFormattedList()}`
    );
    this.code = "UnsupportedFileTypeError";
    this.status = 400;
  }
}

export class MissingFilesError extends Error {
  constructor() {
    super("Two files must be uploaded.");
    this.code = "MissingFilesError";
    this.status = 400;
  }
}

export class LimitFileSizeError extends Error {
  constructor() {
    super(
      `File size is too large. Maximum allowed size is ${MAX_FILE_SIZE}MB.`
    );
    this.code = "LimitFileSizeError";
    this.status = 400;
  }
}
