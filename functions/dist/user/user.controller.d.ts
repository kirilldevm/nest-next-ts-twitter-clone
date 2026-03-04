import { Request } from 'express';
import { type ReqUser } from 'src/auth/guard/auth.guard';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: string): Promise<import("./entity/user.entity").User | null>;
    deleteUser(req: Request & {
        user: ReqUser;
    }, id: string): Promise<void>;
}
