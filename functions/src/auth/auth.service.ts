import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { getErrorMessage, isFirebaseAuthError } from 'src/common/error.utils';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/user/entity/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SigninDto } from './dto/signin.dto';

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

    // If photoURL is provided, validate it
    if (trimmedPhoto) {
      try {
        new URL(trimmedPhoto);
        createUserOptions.photoURL = trimmedPhoto;
      } catch {
        // Skip photoURL
      }
    }

    let userRecord: admin.auth.UserRecord;
    let userData: User;
    try {
      userRecord = await admin.auth().createUser(createUserOptions);
    } catch (err) {
      if (isFirebaseAuthError(err)) {
        if (err.code === 'auth/email-already-exists') {
          throw new ConflictException('The email address is already in use');
        }
        if (err.code === 'auth/invalid-photo-url') {
          throw new BadRequestException('Profile image must be a valid URL');
        }
      }
      throw err;
    }

    try {
      const user = await this.userRepository.createUser({
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
      userData = user!;

      // Send verification email
      try {
        await this.emailService.sendVerificationLink(email);
      } catch (emailError: unknown) {
        throw new BadRequestException(
          'Failed to send verification email: ' + getErrorMessage(emailError),
        );
      }

      return {
        success: true,
        message:
          'Your account was created. Please check your email for a verification link before signing in.',
        user: userData,
      };
    } catch (err) {
      await admin.auth().deleteUser(userRecord.uid);
      await this.userRepository.deleteUser(userRecord.uid);

      if (isFirebaseAuthError(err)) {
        if (err.code === 'auth/email-already-exists') {
          throw new ConflictException('The email address is already in use');
        }
        if (err.code === 'auth/invalid-photo-url') {
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
        userData.emailVerified = userRecord.emailVerified;
      }
    }

    if (!userData.emailVerified) {
      return {
        success: false,
        message:
          'Please verify your email before signing in. Check your inbox (and spam folder) for the link we sent when you created your account.',
      };
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

    return {
      success: true,
      message: 'Signin successful',
      user: userData,
    };
  }

  async resendVerificationEmail(dto: ForgotPasswordDto) {
    const { email } = dto;
    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (err) {
      if (isFirebaseAuthError(err) && err.code === 'auth/user-not-found') {
        throw new BadRequestException('No account found with this email');
      }
      throw err;
    }

    const hasPassword = userRecord.providerData.some(
      (p) => p.providerId === 'password',
    );
    if (!hasPassword) {
      throw new BadRequestException(
        'This account uses Google sign-in. Use "Continue with Google" instead.',
      );
    }

    const user = await this.userRepository.getUser(userRecord.uid);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }
    if (user.emailVerified) {
      throw new BadRequestException(
        'Email is already verified. You can sign in now.',
      );
    }

    await this.emailService.sendVerificationLink(email);
    return { ok: true };
  }

  async checkEmailForPasswordReset(dto: ForgotPasswordDto) {
    try {
      const userRecord = await admin.auth().getUserByEmail(dto.email);

      // Check if user has a password (email/password provider)
      const hasPassword = userRecord.providerData.some(
        (p) => p.providerId === 'password',
      );
      if (!hasPassword) {
        throw new BadRequestException(
          'This account uses Google sign-in. Use "Continue with Google" instead.',
        );
      }

      return { ok: true };
    } catch (err) {
      if (isFirebaseAuthError(err) && err.code === 'auth/user-not-found') {
        throw new BadRequestException('No account found with this email');
      }
      throw err;
    }
  }
}
