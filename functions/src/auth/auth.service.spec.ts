import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email/email.service';
import { UserRepository } from '../user/repository/user.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const mockUserRepo = { getUser: jest.fn(), createUser: jest.fn() };
    const mockEmailService = { sendVerificationEmail: jest.fn() };

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
});
