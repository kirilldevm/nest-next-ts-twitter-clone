import { User } from '../entity/user.entity';
export declare class UserRepository {
    private usersDb;
    private mapDoc;
    getUser(id: string): Promise<User | null>;
    createUser(data: User): Promise<User | null>;
    deleteUser(id: string): Promise<void>;
    updateUser(id: string, data: Partial<User>): Promise<void>;
}
