"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileImageMulterOptions = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_FILE_SIZE = 5 * 1024 * 1024;
exports.profileImageMulterOptions = {
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
};
//# sourceMappingURL=multer.config.js.map