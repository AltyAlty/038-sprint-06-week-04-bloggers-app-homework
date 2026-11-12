import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';

export const decodeRefreshToken = (
  app: NestExpressApplication,
  token: string
): { userId: string; deviceId: string; iat: Date; exp: Date } | null => {
  const jwtService: JwtService = app.get<JwtService>(JwtService);
  const decodedToken: { userId: string; deviceId: string; iat: number; exp: number } | null = jwtService.decode(token);

  if (!decodedToken) {
    return null;
  } else {
    return {
      userId: decodedToken.userId,
      deviceId: decodedToken.deviceId,
      iat: new Date(decodedToken.iat * 1000),
      exp: new Date(decodedToken.exp * 1000),
    };
  }
};
