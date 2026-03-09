import { EmailService } from 'src/email/email.service';
import { StorageService } from 'src/storage/storage.service';
import { User } from 'src/user/entity/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import type { SignupFormDto } from './dto/signup-form.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly emailService;
    private readonly storageService;
    constructor(userRepository: UserRepository, emailService: EmailService, storageService: StorageService);
    signupWithFile(signupForm: SignupFormDto, file?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
    }>;
    signup(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        message: string;
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
