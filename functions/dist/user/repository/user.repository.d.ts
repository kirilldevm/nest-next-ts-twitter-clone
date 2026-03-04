import { User } from '../entity/user.entity';
export declare class UserRepository {
    private usersDb;
    private mapDoc;
    getUser(id: string): Promise<User | null>;
    createUser(data: User): Promise<void>;
    deleteUser(id: string): Promise<void>;
}
