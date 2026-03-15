import { CommentRepository } from '../comment/repository/comment.repository';
import { PostRepository } from '../post/repository/post.repository';
import { ReactionRepository } from '../reaction/repository/reaction.repository';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';
export declare class UserService {
    private readonly userRepository;
    private readonly postRepository;
    private readonly commentRepository;
    private readonly reactionRepository;
    private readonly storageService;
    constructor(userRepository: UserRepository, postRepository: PostRepository, commentRepository: CommentRepository, reactionRepository: ReactionRepository, storageService: StorageService);
    getUser(id: string): Promise<import("./entity/user.entity").User | null>;
    deleteUser(uid: string): Promise<void>;
    updateUser(uid: string, updateUserDto: UpdateUserDto): Promise<import("./entity/user.entity").User | null>;
}
