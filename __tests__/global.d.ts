declare module "db/parsedFileCache.js" {
  import { LRUCache } from "lru-cache";

  export const parsedFileCache: jest.Mocked<LRUCache<string, string>>;
  export function createHash(content: string): string;
}

declare module "server/controllers/parseController.js" {
  import { Request, Response, NextFunction } from "express";

  export interface ParseController {
    handleRequest(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void>;
    checkCache(fileHash: string, originalname: string): string | null;
    parseFile(file: { buffer: Buffer; originalname: string }): Promise<string>;
    parsePDF(buffer: Buffer): Promise<string>;
    getFileExtension(filename: string): string;
  }

  export const parseController: ParseController;
}

declare module "pdfjs-dist" {
  export interface TextItem {
    str: string;
    transform: number[];
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface GetDocumentParams {
    data: Uint8Array;
  }

  export const getDocument: jest.Mock<{
    promise: Promise<PDFDocumentProxy>;
  }>;
}
