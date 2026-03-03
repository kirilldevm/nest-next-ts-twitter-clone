import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: string): Promise<import("./entity/user.entity").User | null>;
}
