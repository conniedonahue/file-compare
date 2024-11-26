import { LRUCache } from "lru-cache";
import crypto from "crypto";

/*
LRU Cache for parsed file content.
Cuts down computational lift of parsing the same file
Note: For production, encrypt parsed content to prevent unauthorized access.
Settings: 
- max = 200K (for 10% of projected 1MM daily comparisons of 2 files)
- ttl = 24 hrs
*/

export const parsedFileCache = new LRUCache({
  max: 200_000,
  maxSize: 2_000, // Set a maximum size in MB
  sizeCalculation: (value) => {
    // Estimate size in MB; assuming value is a string or buffer
    return Math.ceil(Buffer.byteLength(value, "utf8") / (1024 * 1024));
  },
  ttl: 24 * 60 * 60 * 1000,
});

export const createHash = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};
