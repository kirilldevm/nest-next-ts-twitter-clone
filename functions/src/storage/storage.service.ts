import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

/** Extract bucket and file path from Firebase Storage URL. */
function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  if (!url || typeof url !== 'string') return null;

  // Format: .../v0/b/{bucket}/o/{encodedPath}?...
  const match = url.match(/\/b\/([^/]+)\/o\/([^?#]+)/);
  if (!match) return null;
  try {
    return {
      bucket: decodeURIComponent(match[1]),
      path: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

@Injectable()
export class StorageService {
  async deleteFileByUrl(url: string): Promise<void> {
    const parsed = parseStorageUrl(url);
    if (!parsed) {
      console.warn('StorageService.deleteFileByUrl: could not parse URL', {
        url: url?.slice?.(0, 120),
      });
      return;
    }

    const { bucket: bucketName, path } = parsed;

    try {
      const bucket = admin.storage().bucket(bucketName);

      await bucket.file(path).delete({ ignoreNotFound: true });
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 404 || code === 5) return;
      console.warn('StorageService.deleteFileByUrl failed:', {
        bucketName,
        path,
        err,
      });
    }
  }
}
