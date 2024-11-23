const LRUCache = jest.fn().mockImplementation(() => {
  return {
    has: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  };
});

export const parsedFileCache = new LRUCache();
export const createHash = jest.fn((content) => content);
