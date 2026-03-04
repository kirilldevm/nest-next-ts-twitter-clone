import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, profileImageUrl } =
      createUserDto;

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        photoURL:
          profileImageUrl && profileImageUrl.trim() !== ''
            ? profileImageUrl
            : undefined,
      });
    } catch (err) {
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

    try {
      await this.userRepository.createUser({
        id: userRecord.uid,
        email: userRecord.email || '',
        firstName,
        lastName,
        profileImageUrl: profileImageUrl || null,
        createdAt: new Date(),
        emailVerified: false,
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
      throw new BadRequestException('Failed to create user');
    }
  }

  async signin(signinDto: SigninDto) {
    const { token } = signinDto;

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log(decodedToken);

    const userRecord = await admin.auth().getUser(decodedToken.uid);
    console.log(userRecord);

    return userRecord;

    // try {
    //   const userRecord = await admin.auth().verifyIdToken(token);

    //   console.log(userRecord);

    //   const isPasswordValid = await admin.auth().getUser(userRecord.uid);
    //   return isPasswordValid;
    // } catch (error) {
    //   if (error instanceof Error) {
    //     throw new UnauthorizedException(error.message);
    //   }
    //   throw new UnauthorizedException('Invalid credentials');
    // }
  }
}
