import { EmailService } from 'src/email/email.service';
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
    private readonly emailService;
    constructor(userRepository: UserRepository, postRepository: PostRepository, commentRepository: CommentRepository, reactionRepository: ReactionRepository, storageService: StorageService, emailService: EmailService);
    getUser(id: string): Promise<import("./entity/user.entity").User | null>;
    sendVerificationEmail(uid: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteUser(uid: string): Promise<void>;
    updateUser(uid: string, updateUserDto: UpdateUserDto): Promise<import("./entity/user.entity").User | null>;
}
