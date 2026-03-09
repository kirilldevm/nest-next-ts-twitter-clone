import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { EmailService } from 'src/email/email.service';
import { StorageService } from 'src/storage/storage.service';
import { User } from 'src/user/entity/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import type { SignupFormDto } from './dto/signup-form.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  async signupWithFile(signupForm: SignupFormDto, file?: Express.Multer.File) {
    let profileImageUrl: string | null = null;
    if (file?.buffer) {
      profileImageUrl = await this.storageService.uploadProfileImage(
        Buffer.from(file.buffer),
        file.mimetype,
        file.originalname,
      );
    } else if (
      typeof signupForm.profileImageUrl === 'string' &&
      signupForm.profileImageUrl.trim() !== ''
    ) {
      profileImageUrl = signupForm.profileImageUrl.trim();
    }

    const createUserDto: CreateUserDto = {
      email: signupForm.email,
      password: signupForm.password,
      firstName: signupForm.firstName,
      lastName: signupForm.lastName,
      profileImageUrl: profileImageUrl || undefined,
    };
    return this.signup(createUserDto);
  }

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
        await this.emailService.sendVerificationLink(email);
      } catch (emailError) {
        throw new BadRequestException(
          'Failed to send verification email: ' + (emailError as Error).message,
        );
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

    const user = await this.userRepository.getUser(decodedToken.uid);

    let userData: User;
    if (!user) {
      userData = {
        id: decodedToken.uid,
        email: userRecord.email || '',
        firstName: userRecord.displayName?.split(' ')[0],
        lastName: userRecord.displayName?.split(' ')[1],
        photoURL: userRecord.photoURL,
        createdAt: new Date(),
        emailVerified: userRecord.emailVerified,
      };
      await this.userRepository.createUser(userData);
    } else {
      userData = user;

      // Verify user's email if verified
      if (userRecord.emailVerified && !user.emailVerified) {
        await this.userRepository.updateUser(decodedToken.uid, {
          emailVerified: userRecord.emailVerified,
        });
      }
    }

    return {
      success: true,
      message: 'Signin successful',
      user: userData,
    };
  }

  async signInWithGoogle(signinDto: SigninDto) {
    const { token } = signinDto;

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    const user = await this.userRepository.getUser(decodedToken.uid);

    let userData: User;
    if (!user) {
      userData = {
        id: decodedToken.uid,
        email: userRecord.email || '',
        firstName: userRecord.displayName?.split(' ')[0],
        lastName: userRecord.displayName?.split(' ')[1],
        photoURL: userRecord.photoURL,
        createdAt: new Date(),
        emailVerified: true,
      };
      await this.userRepository.createUser(userData);
    } else {
      userData = user;
      if (!userData.emailVerified) {
        userData.emailVerified = true;
        await this.userRepository.updateUser(decodedToken.uid, {
          emailVerified: true,
        });
      }
    }

    console.log('signin with Google successful', userData);

    return {
      success: true,
      message: 'Signin successful',
      user: userData,
    };
  }
}
