import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthConfig } from '../../../src/modules/user/config/auth.config';

export const createBasicAuthToken = (app: NestExpressApplication): string => {
  const authConfig: AuthConfig = app.get(AuthConfig);
  const credentials: string = `${authConfig.BASIC_AUTH_LOGIN}:${authConfig.BASIC_AUTH_PASSWORD}`;
  const token: string = Buffer.from(credentials).toString('base64');
  return `Basic ${token}`;
};
