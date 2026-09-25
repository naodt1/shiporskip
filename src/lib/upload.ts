import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

export const allowedImage = (type: string) => type in EXT;

/** Stores an image in Vercel Blob when configured, else in public/uploads. */
export async function storeImage(file: File): Promise<string> {
  const name = `${randomBytes(12).toString("hex")}.${EXT[file.type]}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`projects/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Only accept image URLs we issued. */
export function isOurImageUrl(url: string) {
  if (/^\/uploads\/[a-f0-9]{24}\.(png|jpg|webp|gif)$/.test(url)) return true;
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}
