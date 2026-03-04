import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, profileImageUrl } =
      createUserDto;

    const createUserOptions: admin.auth.CreateRequest = {
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    };
    const trimmedPhoto =
      typeof profileImageUrl === 'string' && profileImageUrl.trim() !== ''
        ? profileImageUrl.trim()
        : null;
    if (trimmedPhoto) {
      const parsed = new URL(trimmedPhoto);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        createUserOptions.photoURL = trimmedPhoto;
      }
    }

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().createUser(createUserOptions);
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
        photoURL:
          profileImageUrl && profileImageUrl.trim() !== ''
            ? profileImageUrl
            : null,
        createdAt: new Date(),
        emailVerified: false,
      });

      // Send verification email
      try {
        await this.emailService.sendVerificationLink(email, name);
      } catch (emailError) {
        throw new BadRequestException('Failed to send verification email');
      }

      return {
        success: true,
        message: 'User created successfully',
      };
    } catch (err) {
      await admin.auth().deleteUser(userRecord.uid);
      await this.userRepository.deleteUser(userRecord.uid);

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

  async signin(signinDto: SigninDto) {
    const { token } = signinDto;

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    if (!userRecord.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    return {
      success: true,
      message: 'Signin successful',
    };
  }
}
