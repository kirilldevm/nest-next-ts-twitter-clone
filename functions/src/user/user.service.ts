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

  async deleteUser(uid: string) {
    return this.userRepository.deleteUser(uid);
  }
}
