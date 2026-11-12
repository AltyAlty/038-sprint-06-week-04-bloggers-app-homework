import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { validUserAgents } from '../../test-data/auth.test-data';

export const createNewAccessAndRefreshTokens = async (
  app: NestExpressApplication,
  expectedStatus?: HttpStatus,
  noRefreshToken?: boolean,
  refreshToken?: any,
  noUserAgent?: boolean,
  userAgent?: any
): Promise<{
  AT: string | undefined;
  RT: string | undefined;
  hasHttpOnly: boolean | undefined;
  hasSecure: boolean | undefined;
}> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_CREATE_NEW_ACCESS_AND_REFRESH_TOKENS_PATH}`;
  let response: Response;

  if (noUserAgent) {
    if (noRefreshToken) {
      response = await request(app.getHttpServer()).post(url).expect(testStatus);
    } else {
      response = await request(app.getHttpServer())
        .post(url)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(testStatus);
    }
  } else {
    if (noRefreshToken) {
      response = await request(app.getHttpServer())
        .post(url)
        .set('User-Agent', userAgent ?? validUserAgents.userAgent_01)
        .expect(testStatus);
    } else {
      response = await request(app.getHttpServer())
        .post(url)
        .set('User-Agent', userAgent ?? validUserAgents.userAgent_01)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(testStatus);
    }
  }

  const { accessToken: newAccessToken } = response.body as { accessToken?: string };

  /*Шаги получения RT:
  1. ["cookie1=value1; Path=/" , "refreshToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Path=/", "cookie3=value3; Path=/"]
  2. "refreshToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Path=/"
  3. "refreshToken=eyJhbGciOiJIUzI1NiIs..."
  4. "eyJhbGciOiJIUzI1NiIs..."*/
  const newRefreshToken: string | undefined = (response.headers['set-cookie'] as unknown as string[] | undefined)
    ?.find(cookie => cookie.startsWith('refreshToken='))
    ?.split(';')[0]
    ?.split('=')[1];

  const refreshTokenCookieString: string | undefined = (
    response.headers['set-cookie'] as unknown as string[] | undefined
  )?.find(cookie => cookie.startsWith('refreshToken='));

  const hasHttpOnly: boolean | undefined = refreshTokenCookieString?.includes('HttpOnly');
  const hasSecure: boolean | undefined = refreshTokenCookieString?.includes('Secure');
  return { AT: newAccessToken, RT: newRefreshToken, hasHttpOnly, hasSecure };
};
