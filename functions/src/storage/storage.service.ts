import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

function getPathFromStorageUrl(url: string): string | null {
  if (!url || !url.startsWith('https://firebasestorage.googleapis.com')) {
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
    if (!path) return;

    try {
      const app = admin.app();

      const bucketName =
        app.options.storageBucket ??
        `${app.options.projectId ?? 'fir-twitter-clone-ec0b2'}.appspot.com`;

      const bucket = admin.storage().bucket(bucketName);

      await bucket.file(path).delete();
    } catch (err) {
      // 404 = file already deleted; log but don't throw
      const code = (err as { code?: number })?.code;

      if (code === 404 || code === 5) return;

      console.warn('Failed to delete storage file:', path, err);
    }
  }
}
