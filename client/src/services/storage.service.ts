import { storage } from '@/config/firebase.config';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

const PROFILE_IMAGES_PATH = 'profile-images';
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

export async function deleteProfileImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
