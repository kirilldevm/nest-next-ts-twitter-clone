import { registerAs } from '@nestjs/config';

const configService = registerAs('config', () => ({
  port: process.env.PORT ?? 3000,
}));

export default configService;
