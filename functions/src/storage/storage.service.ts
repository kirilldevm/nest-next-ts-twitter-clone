import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class StorageService {
  async uploadProfileImage(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<string> {
    if (!ALLOWED_MIMES.includes(mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`,
      );
    }
    if (buffer.length > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `File too large. Max size: ${MAX_SIZE_BYTES / 1024 / 1024}MB`,
      );
    }

    const ext = originalName.split('.').pop() || 'jpg';
    const filename = `profile-images/${randomUUID()}.${ext}`;

    const bucket = admin.storage().bucket();
    const file = bucket.file(filename);

    await file.save(buffer, {
      contentType: mimetype,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  }
}
