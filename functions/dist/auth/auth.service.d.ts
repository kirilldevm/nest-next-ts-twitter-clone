import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
export declare class AuthService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    signup(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        message: string;
        verificationLink: string;
        token: string;
    }>;
    signin(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
