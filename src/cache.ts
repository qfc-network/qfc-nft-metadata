import fs from "fs";
import path from "path";
import os from "os";

const CACHE_DIR = path.join(os.homedir(), ".qfc-nft-metadata");

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function cacheMetadata(cid: string, data: unknown): void {
  ensureCacheDir();
  fs.writeFileSync(
    path.join(CACHE_DIR, `${cid}.json`),
    JSON.stringify(data, null, 2)
  );
}

export function cacheFile(cid: string, buffer: Buffer): void {
  ensureCacheDir();
  fs.writeFileSync(path.join(CACHE_DIR, cid), buffer);
}

export function getCachedMetadata(cid: string): unknown | null {
  const filePath = path.join(CACHE_DIR, `${cid}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getCachedFile(cid: string): Buffer | null {
  const filePath = path.join(CACHE_DIR, cid);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}
