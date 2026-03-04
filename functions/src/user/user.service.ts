import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(id: string) {
    return this.userRepository.getUser(id);
  }

  async deleteUser(uid: string, id: string) {
    const user = await this.userRepository.getUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.id !== uid) {
      throw new ForbiddenException('You are not allowed to delete this user');
    }
    return this.userRepository.deleteUser(id);
  }
}
