import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { v7 } from 'uuid';
import { AuthConfig } from '../../../src/modules/user/config/auth.config';

export const createRandomRefreshToken = (
  app: NestExpressApplication,
  userId: string = v7(),
  deviceId: string = v7(),
  signOptions?: JwtSignOptions
): string => {
  const jwtService: JwtService = app.get<JwtService>(JwtService);
  const authConfig: AuthConfig = app.get<AuthConfig>(AuthConfig);

  return jwtService.sign(
    { userId, deviceId },
    {
      secret: authConfig.RT_SECRET,
      expiresIn: authConfig.RT_TIME_IN_SECONDS as JwtSignOptions['expiresIn'],
      ...signOptions,
    }
  );
};
