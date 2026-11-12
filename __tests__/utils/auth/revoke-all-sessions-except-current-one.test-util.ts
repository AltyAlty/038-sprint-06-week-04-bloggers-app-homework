import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';

export const revokeAllSessionsExceptCurrentOne = async (
  app: NestExpressApplication,
  expectedStatus?: HttpStatus,
  noRefreshToken?: boolean,
  refreshToken?: any
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.SECURITY_DEVICES_PREFIX}/${SETTINGS.SECURITY_DEVICES_REVOKE_ALL_SESSIONS_EXCEPT_CURRENT_ONE_PATH}`;
  let response: Response;

  if (noRefreshToken) {
    response = await request(app.getHttpServer()).delete(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .delete(url)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(testStatus);
  }

  return response.body;
};
