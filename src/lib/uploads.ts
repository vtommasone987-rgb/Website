/**
 * Rules for accepting uploaded photos.
 *
 * Uploads are admin-only, but they are the one place where a file chosen by a
 * person ends up being served back from our own origin — so a file that is not
 * really an image is a stored-XSS and defacement risk, not just a broken photo.
 * Nothing here trusts the browser: not the filename, not the Content-Type.
 */

/** Per-file cap. Generous for a phone photo, far below the 15MB action limit. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Cap on how many files one submission may add. */
export const MAX_IMAGES_PER_ASSET = 12;

/**
 * The only formats accepted, and the extension each one is stored under.
 *
 * Note what is missing: SVG. An SVG is a document that can carry script, and it
 * would be served from our own origin — so it is excluded no matter what the
 * browser claims the file is.
 */
const MAGIC_BYTES = {
  jpg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  gif: [0x47, 0x49, 0x46, 0x38], // "GIF8", covering both 87a and 89a
} as const;

export type ImageExtension = "jpg" | "png" | "gif" | "webp";

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Identifies an image by its actual leading bytes, returning the extension to
 * store it under, or null if the content is not an accepted image.
 *
 * This is the check that matters: `file.type` is supplied by the client and can
 * say "image/png" for a file full of HTML.
 */
export function detectImageType(bytes: Uint8Array): ImageExtension | null {
  if (startsWith(bytes, MAGIC_BYTES.jpg)) return "jpg";
  if (startsWith(bytes, MAGIC_BYTES.png)) return "png";
  if (startsWith(bytes, MAGIC_BYTES.gif)) return "gif";
  // WebP is a RIFF container: "RIFF" then a 4-byte length, then "WEBP".
  const isRiff = startsWith(bytes, [0x52, 0x49, 0x46, 0x46]);
  const isWebp =
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  if (isRiff && isWebp) return "webp";
  return null;
}
