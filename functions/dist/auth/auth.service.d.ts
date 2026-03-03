import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AuthService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    signup(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
    }>;
}
