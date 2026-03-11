import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    getUser(id: string): Promise<import("./entity/user.entity").User | null>;
    deleteUser(uid: string): Promise<void>;
    updateUser(uid: string, updateUserDto: UpdateUserDto): Promise<import("./entity/user.entity").User | null>;
}
