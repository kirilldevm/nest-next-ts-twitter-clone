import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getAuth(): string;
    signup(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
    }>;
}
