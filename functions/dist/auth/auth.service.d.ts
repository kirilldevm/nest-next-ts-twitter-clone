import { EmailService } from 'src/email/email.service';
import { User } from 'src/user/entity/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly emailService;
    constructor(userRepository: UserRepository, emailService: EmailService);
    signup(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        message: string;
        user: User;
    }>;
    signin(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
        user: User;
    }>;
    signInWithGoogle(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
        user: User;
    }>;
}
