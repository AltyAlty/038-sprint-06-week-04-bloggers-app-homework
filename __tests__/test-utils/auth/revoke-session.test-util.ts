import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';

export const revokeSession = async (
  app: NestExpressApplication,
  expectedStatus?: HttpStatus,
  noRefreshToken?: boolean,
  refreshToken?: any
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_REVOKE_SESSION_PATH}`;
  let response: Response;

  if (noRefreshToken) {
    response = await request(app.getHttpServer()).post(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .post(url)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(testStatus);
  }

  return response.body;
};
