import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
    }>;
    signin(signinDto: SigninDto): Promise<import("firebase-admin/auth").UserRecord>;
}
