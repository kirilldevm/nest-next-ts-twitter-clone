import { EmailService } from 'src/email/email.service';
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
    }>;
    signin(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
