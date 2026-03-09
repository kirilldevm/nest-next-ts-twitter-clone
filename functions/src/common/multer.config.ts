import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const profileImageMulterOptions: MulterOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
};
