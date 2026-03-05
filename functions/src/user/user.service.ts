import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
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

  async updateUser(uid: string, updateUserDto: UpdateUserDto) {
    Object.keys(updateUserDto).forEach(
      (key) => updateUserDto[key] === undefined && delete updateUserDto[key],
    );
    return this.userRepository.updateUser(uid, updateUserDto);
  }
}
