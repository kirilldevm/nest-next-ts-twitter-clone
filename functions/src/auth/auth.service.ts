import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, profileImageUrl } =
      createUserDto;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      photoURL:
        profileImageUrl && profileImageUrl.trim() !== ''
          ? profileImageUrl
          : undefined,
    });

    try {
      await this.userRepository.createUser(userRecord.uid, {
        email: userRecord.email || '',
        firstName,
        lastName,
        profileImageUrl: profileImageUrl || null,
      });

      return {
        id: userRecord.uid,
        email: userRecord.email || '',
      };
    } catch (err) {
      await admin.auth().deleteUser(userRecord.uid);
      if (err instanceof Error && 'code' in err) {
        const code = err.code as string;
        if (code === 'auth/email-already-exists') {
          throw new ConflictException('The email address is already in use');
        }
        if (code === 'auth/invalid-photo-url') {
          throw new BadRequestException('Profile image must be a valid URL');
        }
      }
      throw err;
    }
  }
}
