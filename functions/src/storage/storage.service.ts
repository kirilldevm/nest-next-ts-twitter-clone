import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

const STORAGE_URL_PREFIXES = [
  'https://firebasestorage.googleapis.com',
  'http://127.0.0.1:9199', // Storage emulator
  'http://localhost:9199',
];

function getPathFromStorageUrl(url: string): string | null {
  if (!url || typeof url !== 'string' || !url.includes('/o/')) {
    return null;
  }

  const isStorageUrl = STORAGE_URL_PREFIXES.some((p) => url.startsWith(p));
  if (!isStorageUrl) {
    return null;
  }

  try {
    const match = url.match(/\/o\/([^?]+)/);
    if (!match) return null;

    const encodedPath = match[1];
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

@Injectable()
export class StorageService {
  async deleteFileByUrl(url: string): Promise<void> {
    const path = getPathFromStorageUrl(url);
    if (!path) {
      console.warn('StorageService.deleteFileByUrl: could not extract path from URL', {
        url: url?.slice?.(0, 100),
      });
      return;
    }

    try {
      const app = admin.app();
      const bucketName =
        app.options.storageBucket ??
        `${app.options.projectId ?? 'fir-twitter-clone-ec0b2'}.appspot.com`;
      const bucket = admin.storage().bucket(bucketName);

      await bucket.file(path).delete({ ignoreNotFound: true });
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 404 || code === 5) return;
      console.warn('StorageService.deleteFileByUrl failed:', { path, err });
    }
  }
}
