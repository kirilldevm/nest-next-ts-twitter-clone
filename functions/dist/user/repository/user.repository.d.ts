import * as admin from 'firebase-admin';
import { User } from '../entity/user.entity';
interface UserDocumentData {
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string | null;
    createdAt?: admin.firestore.Timestamp | string | number;
}
export declare class UserRepository {
    private usersDb;
    private mapDoc;
    getUser(id: string): Promise<User | null>;
    createUser(id: string, data: UserDocumentData): Promise<void>;
}
export {};
