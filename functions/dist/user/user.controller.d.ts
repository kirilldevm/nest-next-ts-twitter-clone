import { type ReqUser } from 'src/auth/guard/auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: string): Promise<import("./entity/user.entity").User | null>;
    sendVerificationEmail(req: ReqUser): Promise<{
        success: boolean;
        message: string;
    }>;
    updateUser(req: ReqUser, updateUserDto: UpdateUserDto): Promise<import("./entity/user.entity").User | null>;
    deleteUser(req: ReqUser): Promise<void>;
}
