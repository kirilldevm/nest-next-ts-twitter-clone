import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as admin from 'firebase-admin';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { EmailService } from '../src/email/email.service';

const AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';

async function getIdTokenFromEmulator(
  email: string,
  password: string,
): Promise<string> {
  const [host, port] = AUTH_EMULATOR_HOST.split(':');
  const url = `http://${host}:${port}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Auth failed: ${JSON.stringify(err)}`);
  }
  const data = (await res.json()) as { idToken?: string };
  return data.idToken!;
}

describe('App (e2e)', () => {
  let app: INestApplication;

  const mockEmailService = {
    sendVerificationLink: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const projectId =
      process.env.GCLOUD_PROJECT ||
      process.env.PROJECT_ID ||
      'fir-twitter-clone-ec0b2';

    if (admin.apps.length) {
      admin.app().delete();
    }
    admin.initializeApp({ projectId });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('returns hello', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('Hello');
        });
    });
  });

  describe('POST /auth/signup', () => {
    const testUser = {
      email: `e2e-${Date.now()}@test.local`,
      password: 'password123',
      firstName: 'E2E',
      lastName: 'Tester',
    };

    it('creates user and returns success', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.id).toBeDefined();
      expect(mockEmailService.sendVerificationLink).toHaveBeenCalledWith(
        testUser.email,
      );
    });
  });

  describe('Auth + Posts flow', () => {
    const testUser = {
      email: `e2e-flow-${Date.now()}@test.local`,
      password: 'password123',
      firstName: 'Flow',
      lastName: 'User',
    };

    let idToken: string;
    let userId: string;

    beforeAll(async () => {
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      userId = signupRes.body.user.id;
      idToken = await getIdTokenFromEmulator(testUser.email, testUser.password);
    });

    it('POST /auth/signin with token returns user or email not verified message', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ token: idToken })
        .expect(201);

      if (res.body.success) {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.id).toBe(userId);
      } else {
        expect(res.body.message).toMatch(/verify/i);
      }
    });

    it('GET /post returns list (public)', async () => {
      const res = await request(app.getHttpServer()).get('/post').expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body).toHaveProperty('nextCursor');
    });

    it('POST /post creates post when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/post')
        .set('Authorization', `Bearer ${idToken}`)
        .send({ title: 'E2E post', text: 'Hello from E2E test' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('E2E post');
      expect(res.body.authorId).toBe(userId);
    });

    it('GET /user/:id returns user', async () => {
      const res = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .expect(200);

      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe(testUser.email);
    });
  });
});
