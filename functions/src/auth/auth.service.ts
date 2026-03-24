import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  getErrorMessage,
  handleFirebaseAuthError,
} from 'src/common/error.utils';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/user/entity/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async signup(dto: SignUpDto) {
    const { email, password, firstName, lastName, profileImageUrl } = dto;

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        photoURL: profileImageUrl ?? null,
      });
    } catch (err) {
      handleFirebaseAuthError(err);
    }

    try {
      const user = await this.userRepository.createUser({
        id: userRecord.uid,
        email: userRecord.email || '',
        firstName,
        lastName,
        photoURL: profileImageUrl,
        createdAt: new Date(),
        emailVerified: false,
      });

      try {
        await this.emailService.sendVerificationLink(email);
      } catch (emailErr) {
        throw new BadRequestException(
          'Failed to send verification email: ' + getErrorMessage(emailErr),
        );
      }

      return {
        success: true,
        message:
          'Your account was created. Please check your email for a verification link before signing in.',
        user,
      };
    } catch (err) {
      await admin
        .auth()
        .deleteUser(userRecord.uid)
        .catch(() => {});
      await this.userRepository.deleteUser(userRecord.uid).catch(() => {});
      throw err;
    }
  }

  async signin(signinDto: SigninDto) {
    const userData = await this.findOrCreateUser(signinDto.token, false);

    if (!userData.emailVerified) {
      return {
        success: false,
        message:
          'Please verify your email before signing in. Check your inbox (and spam folder) for the link we sent when you created your account.',
      };
    }

    return { success: true, message: 'Signin successful', user: userData };
  }

  async signInWithGoogle(signinDto: SigninDto) {
    const userData = await this.findOrCreateUser(signinDto.token, true);
    return { success: true, message: 'Signin successful', user: userData };
  }

  async resendVerificationEmail(dto: ForgotPasswordDto) {
    const userRecord = await this.getPasswordUserByEmail(dto.email);

    const user = await this.userRepository.getUser(userRecord.uid);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }
    if (user.emailVerified) {
      throw new BadRequestException(
        'Email is already verified. You can sign in now.',
      );
    }

    await this.emailService.sendVerificationLink(dto.email);
    return { ok: true };
  }

  async checkEmailForPasswordReset(dto: ForgotPasswordDto) {
    await this.getPasswordUserByEmail(dto.email);
    return { ok: true };
  }

  /**
   * Resolves an existing Firestore user or creates one from the Firebase Auth record.
   * For Google sign-in, email is always marked as verified.
   */
  private async findOrCreateUser(
    token: string,
    trustEmailVerified: boolean,
  ): Promise<User> {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    const existing = await this.userRepository.getUser(decodedToken.uid);
    if (existing) {
      const shouldVerify =
        (trustEmailVerified || userRecord.emailVerified) &&
        !existing.emailVerified;

      if (shouldVerify) {
        await this.userRepository.updateUser(decodedToken.uid, {
          emailVerified: true,
        });
        existing.emailVerified = true;
      }
      return existing;
    }

    const newUser: User = {
      id: decodedToken.uid,
      email: userRecord.email || '',
      firstName: userRecord.displayName?.split(' ')[0],
      lastName: userRecord.displayName?.split(' ')[1],
      photoURL: userRecord.photoURL,
      createdAt: new Date(),
      emailVerified: trustEmailVerified || userRecord.emailVerified,
    };
    await this.userRepository.createUser(newUser);
    return newUser;
  }

  /**
   * Looks up a Firebase Auth user by email and ensures they use password auth.
   * Throws on user-not-found or if the account is Google-only.
   */
  private async getPasswordUserByEmail(
    email: string,
  ): Promise<admin.auth.UserRecord> {
    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (err) {
      handleFirebaseAuthError(err);
    }

    const hasPassword = userRecord.providerData.some(
      (p) => p.providerId === 'password',
    );
    if (!hasPassword) {
      throw new BadRequestException(
        'This account uses Google sign-in. Use "Continue with Google" instead.',
      );
    }

    return userRecord;
  }
}
