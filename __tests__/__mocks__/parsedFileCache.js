import LRUCache from "lru-cache";

export const parsedFileCache = new LRUCache();
export const createHash = jest.fn((content) => content);
