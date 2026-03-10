import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SigninDto } from './dto/signin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupForm: CreateUserDto): Promise<{
        success: boolean;
        message: string;
        user: import("../user/entity/user.entity").User;
    }>;
    signin(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        message: string;
        user: import("../user/entity/user.entity").User;
    }>;
    signinWithGoogle(signinDto: SigninDto): Promise<{
        success: boolean;
        message: string;
        user: import("../user/entity/user.entity").User;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        ok: boolean;
    }>;
}
