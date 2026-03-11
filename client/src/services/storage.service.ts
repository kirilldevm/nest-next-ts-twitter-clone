import { storage } from '@/config/firebase.config';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

const PROFILE_IMAGES_PATH = 'profile-images';
const POST_IMAGES_PATH = 'post-images';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadProfileImage(
  file: File,
): Promise<{ url: string; path: string }> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File too large. Max size: 5MB');
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${PROFILE_IMAGES_PATH}/${crypto.randomUUID()}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function uploadPostImage(
  file: File,
): Promise<{ url: string; path: string }> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File too large. Max size: 5MB');
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${POST_IMAGES_PATH}/${crypto.randomUUID()}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteProfileImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function deleteProfileImageByUrl(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}

const DELETE_RETRY_ATTEMPTS = 3;
const DELETE_RETRY_DELAY_MS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Best-effort delete of old profile image with retries. Fails silently
 * for external URLs (e.g. Google avatar) or transient errors.
 */
export async function deleteOldProfileImage(url: string): Promise<void> {
  if (!url || !url.startsWith('https://firebasestorage.googleapis.com')) {
    return;
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= DELETE_RETRY_ATTEMPTS; attempt++) {
    try {
      await deleteProfileImageByUrl(url);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < DELETE_RETRY_ATTEMPTS) {
        await sleep(DELETE_RETRY_DELAY_MS);
      }
    }
  }
  // Log but don't throw - orphaned image is acceptable; user has new photo
  console.warn('Failed to delete old profile image after retries:', lastError);
}
