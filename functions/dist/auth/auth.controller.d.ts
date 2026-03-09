import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupFormDto } from './dto/signup-form.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupForm: SignupFormDto, file?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
    }>;
    signin(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
        user: import("../user/entity/user.entity").User;
    }>;
    signinWithGoogle(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
        user: import("../user/entity/user.entity").User;
    }>;
}
