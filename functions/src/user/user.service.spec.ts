import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';

const mockDeleteUser = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('firebase-admin', () => ({
  auth: () => ({
    deleteUser: mockDeleteUser,
    updateUser: mockUpdateUser,
  }),
}));

describe('UserService', () => {
  let service: UserService;
  let getUserMock: jest.Mock;
  let updateUserRepoMock: jest.Mock;
  let deleteUserRepoMock: jest.Mock;

  const mockUser: User = {
    id: 'uid-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    photoURL: null,
    createdAt: new Date(),
    emailVerified: true,
  };

  beforeEach(async () => {
    mockDeleteUser.mockReset();
    mockUpdateUser.mockReset();

    getUserMock = jest.fn();
    updateUserRepoMock = jest.fn().mockResolvedValue(undefined);
    deleteUserRepoMock = jest.fn().mockResolvedValue(undefined);

    const mockUserRepo = {
      getUser: getUserMock,
      updateUser: updateUserRepoMock,
      deleteUser: deleteUserRepoMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      getUserMock.mockResolvedValue(mockUser);

      const result = await service.getUser('uid-123');

      expect(getUserMock).toHaveBeenCalledWith('uid-123');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      getUserMock.mockResolvedValue(null);

      const result = await service.getUser('missing');

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete from repository and Firebase Auth', async () => {
      await service.deleteUser('uid-123');

      expect(deleteUserRepoMock).toHaveBeenCalledWith('uid-123');
      expect(mockDeleteUser).toHaveBeenCalledWith('uid-123');
    });
  });

  describe('updateUser', () => {
    it('should update repository and sync displayName/photoURL to Auth', async () => {
      const updatedUser = { ...mockUser, firstName: 'Jane', lastName: 'Doe' };
      getUserMock.mockResolvedValue(updatedUser);

      const result = await service.updateUser('uid-123', {
        firstName: 'Jane',
      });

      expect(updateUserRepoMock).toHaveBeenCalledWith(
        'uid-123',
        { firstName: 'Jane' },
      );
      expect(mockUpdateUser).toHaveBeenCalledWith(
        'uid-123',
        expect.objectContaining({
          displayName: 'Jane Doe',
          photoURL: null,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should not call Auth update when no profile fields change', async () => {
      getUserMock.mockResolvedValue(mockUser);

      await service.updateUser('uid-123', {});

      expect(updateUserRepoMock).toHaveBeenCalledWith('uid-123', {});
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });
});
