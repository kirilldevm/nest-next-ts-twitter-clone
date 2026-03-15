import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email/email.service';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { AuthService } from './auth.service';

const mockCreateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockGetUser = jest.fn();
const mockGetUserByEmail = jest.fn();

jest.mock('firebase-admin', () => ({
  auth: () => ({
    createUser: mockCreateUser,
    deleteUser: mockDeleteUser,
    verifyIdToken: mockVerifyIdToken,
    getUser: mockGetUser,
    getUserByEmail: mockGetUserByEmail,
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let getUserMock: jest.Mock;
  let createUserRepoMock: jest.Mock;
  let sendVerificationLinkMock: jest.Mock;

  const mockUser: User = {
    id: 'uid-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    photoURL: null,
    createdAt: new Date(),
    emailVerified: false,
  };

  const mockAuthUserRecord = {
    uid: 'uid-123',
    email: 'test@example.com',
    displayName: 'John Doe',
    photoURL: null,
    emailVerified: false,
    providerData: [{ providerId: 'password' }],
  };

  beforeEach(async () => {
    mockCreateUser.mockReset();
    mockDeleteUser.mockReset();
    mockVerifyIdToken.mockReset();
    mockGetUser.mockReset();
    mockGetUserByEmail.mockReset();

    getUserMock = jest.fn();
    createUserRepoMock = jest.fn();
    sendVerificationLinkMock = jest.fn();

    const mockUserRepo = {
      getUser: getUserMock,
      createUser: createUserRepoMock,
      updateUser: jest.fn().mockResolvedValue(undefined),
      deleteUser: jest.fn().mockResolvedValue(undefined),
    };
    const mockEmailService = {
      sendVerificationLink: sendVerificationLinkMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create user and send verification email', async () => {
      mockCreateUser.mockResolvedValue({
        uid: 'uid-123',
        email: 'test@example.com',
      });
      createUserRepoMock.mockResolvedValue(mockUser);
      sendVerificationLinkMock.mockResolvedValue(undefined);

      const result = await service.signup({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          displayName: 'John Doe',
        }),
      );
      expect(createUserRepoMock).toHaveBeenCalled();
      expect(sendVerificationLinkMock).toHaveBeenCalledWith('test@example.com');
    });

    it('should include photoURL when valid URL provided', async () => {
      mockCreateUser.mockResolvedValue({
        uid: 'uid-123',
        email: 'test@example.com',
      });
      createUserRepoMock.mockResolvedValue(mockUser);
      sendVerificationLinkMock.mockResolvedValue(undefined);

      await service.signup({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: 'https://example.com/photo.jpg',
      });

      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          photoURL: 'https://example.com/photo.jpg',
        }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const err = new Error('already exists') as Error & { code: string };
      err.code = 'auth/email-already-exists';
      mockCreateUser.mockRejectedValue(err);

      await expect(
        service.signup({
          email: 'exists@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when photo URL is invalid', async () => {
      const err = new Error('invalid photo') as Error & { code: string };
      err.code = 'auth/invalid-photo-url';
      mockCreateUser.mockRejectedValue(err);

      await expect(
        service.signup({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          profileImageUrl: 'not-a-valid-url',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkEmailForPasswordReset', () => {
    it('should return ok when user has password provider', async () => {
      mockGetUserByEmail.mockResolvedValue({
        ...mockAuthUserRecord,
        providerData: [{ providerId: 'password' }],
      });

      const result = await service.checkEmailForPasswordReset({
        email: 'test@example.com',
      });

      expect(result).toEqual({ ok: true });
    });

    it('should throw BadRequestException when user uses Google sign-in only', async () => {
      mockGetUserByEmail.mockResolvedValue({
        ...mockAuthUserRecord,
        providerData: [{ providerId: 'google.com' }],
      });

      await expect(
        service.checkEmailForPasswordReset({ email: 'test@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user not found', async () => {
      const err = new Error('not found') as Error & { code: string };
      err.code = 'auth/user-not-found';
      mockGetUserByEmail.mockRejectedValue(err);

      await expect(
        service.checkEmailForPasswordReset({ email: 'missing@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('signin', () => {
    it('should return success when user exists and email is verified', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'uid-123' });
      mockGetUser.mockResolvedValue({
        ...mockAuthUserRecord,
        emailVerified: true,
      });
      getUserMock.mockResolvedValue({ ...mockUser, emailVerified: true });

      const result = await service.signin({
        token: 'valid-firebase-id-token',
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should create user when not in Firestore (first signin)', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'uid-new' });
      mockGetUser.mockResolvedValue({
        uid: 'uid-new',
        email: 'new@example.com',
        displayName: 'New User',
        emailVerified: true,
      });
      getUserMock.mockResolvedValue(null);
      createUserRepoMock.mockResolvedValue({
        id: 'uid-new',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        emailVerified: true,
      });

      const result = await service.signin({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(createUserRepoMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'uid-new',
          email: 'new@example.com',
        }),
      );
    });
  });

  describe('signInWithGoogle', () => {
    it('should create user and return success when first time', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'uid-google' });
      mockGetUser.mockResolvedValue({
        uid: 'uid-google',
        email: 'google@example.com',
        displayName: 'Google User',
        emailVerified: true,
      });
      getUserMock.mockResolvedValue(null);
      createUserRepoMock.mockResolvedValue({
        id: 'uid-google',
        email: 'google@example.com',
        emailVerified: true,
      });

      const result = await service.signInWithGoogle({ token: 'google-token' });

      expect(result.success).toBe(true);
      expect(result.user.emailVerified).toBe(true);
    });

    it('should return existing user when already in Firestore', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'uid-123' });
      mockGetUser.mockResolvedValue(mockAuthUserRecord);
      getUserMock.mockResolvedValue(mockUser);

      const result = await service.signInWithGoogle({ token: 'token' });

      expect(result.success).toBe(true);
      expect(createUserRepoMock).not.toHaveBeenCalled();
    });
  });
});
