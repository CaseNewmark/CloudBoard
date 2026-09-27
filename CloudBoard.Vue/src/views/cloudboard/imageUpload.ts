import type { InjectionKey } from 'vue';

/** Uploads an image to the open board; resolves to the URL to store, or undefined if it failed (already reported). */
export interface ImageUploader {
  upload(file: File): Promise<string | undefined>;
}

export const imageUploaderKey: InjectionKey<ImageUploader> = Symbol('imageUploader');
