import { ApiException, apiClient } from './apiClient';

/** Upload limits; the API enforces the same ones. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const STORED_IMAGE_URL = /^\/api\/images\/([0-9a-f-]{36})$/i;

/** The ID of an image stored by the API, if `url` points at one. */
export function storedImageId(url: unknown): string | undefined {
  return typeof url === 'string' ? STORED_IMAGE_URL.exec(url.trim())?.[1] : undefined;
}

// Stored images need the user's token, which <img src> can't send, so they're fetched
// with it and shown through object URLs. Images never change, so each is fetched once.
const objectUrls = new Map<string, Promise<string>>();

/** A URL an <img> can display: stored images become object URLs, anything else passes through. */
export function resolveImageUrl(url: string): Promise<string> {
  const id = storedImageId(url);
  if (!id) return Promise.resolve(url);
  let resolved = objectUrls.get(id);
  if (!resolved) {
    resolved = apiClient.getImageBlob(id).then((blob) => URL.createObjectURL(blob));
    resolved.catch(() => objectUrls.delete(id)); // allow a retry later
    objectUrls.set(id, resolved);
  }
  return resolved;
}

/** Explains why a file can't be uploaded, or returns undefined if it can. */
export function imageFileProblem(file: File): string | undefined {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `"${file.name}" isn't a PNG, JPEG, GIF or WebP image.`;
  if (file.size > MAX_IMAGE_BYTES) return `"${file.name}" is larger than ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`;
  return undefined;
}

/** Uploads an image to the board and returns the URL to store in a node. */
export async function uploadImage(boardId: string, file: Blob, fileName?: string): Promise<string> {
  const image = await apiClient.uploadImage(boardId, file, fileName ?? (file instanceof File ? file.name : 'image'));
  return image.url;
}

/** Copies a stored image to another board; other URLs are returned unchanged. */
export async function copyImageToBoard(boardId: string, url: string): Promise<string> {
  const id = storedImageId(url);
  if (!id) return url;
  return (await apiClient.copyImage(boardId, id)).url;
}

/** Reads a stored or remote image as a data: URL (for exports), or undefined if it can't be read. */
export async function imageUrlToDataUrl(url: string): Promise<string | undefined> {
  try {
    const id = storedImageId(url);
    const blob = id ? await apiClient.getImageBlob(id) : undefined;
    if (!blob) return undefined;
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

/** The API's validation message for a failed upload, if there is one. */
export function uploadErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    try {
      const problem = JSON.parse(error.response);
      const first = Object.values(problem.errors ?? {}).flat()[0];
      if (typeof first === 'string') return first;
    } catch {
      // not a problem-details response
    }
    if (error.status === 413) return `Images can be at most ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`;
  }
  return 'The image could not be uploaded.';
}
