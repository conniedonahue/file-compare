const FileExtensions = {
  PDF: "pdf",
  TEXT_BASED: new Set(["md", "py", "ts"]),

  getFormattedList() {
    const extensions = [this.PDF, ...this.TEXT_BASED];
    return extensions.map((ext) => `.${ext}`).join(", ");
  },

  isValid(extension) {
    return extension === this.PDF || this.TEXT_BASED.has(extension);
  },
};

export default FileExtensions;
