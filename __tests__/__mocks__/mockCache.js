import { LRUCache } from "lru-cache";
import { vi } from "vitest";

export const mockCache = new LRUCache({
  max: 100,
  ttl: 24 * 60 * 60 * 1000,
});
export const createHash = vi.fn((content) => content);
