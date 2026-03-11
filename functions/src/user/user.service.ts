import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(id: string) {
    return this.userRepository.getUser(id);
  }

  async deleteUser(uid: string) {
    await this.userRepository.deleteUser(uid);
    await admin.auth().deleteUser(uid);
  }

  async updateUser(uid: string, updateUserDto: UpdateUserDto) {
    const filtered = { ...updateUserDto };
    Object.keys(filtered).forEach(
      (key) =>
        filtered[key as keyof UpdateUserDto] === undefined &&
        delete filtered[key as keyof UpdateUserDto],
    );
    await this.userRepository.updateUser(uid, filtered);

    // Sync displayName and photoURL to Firebase Auth when profile fields change
    if (
      filtered.firstName !== undefined ||
      filtered.lastName !== undefined ||
      filtered.photoURL !== undefined
    ) {
      const current = await this.userRepository.getUser(uid);
      const authUpdate: admin.auth.UpdateRequest = {
        displayName: [current?.firstName ?? '', current?.lastName ?? '']
          .filter(Boolean)
          .join(' '),
        photoURL: current?.photoURL ?? null,
      };
      await admin.auth().updateUser(uid, authUpdate);
    }

    return this.userRepository.getUser(uid);
  }
}
