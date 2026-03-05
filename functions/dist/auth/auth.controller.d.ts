import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        message: string;
    }>;
    signin(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
