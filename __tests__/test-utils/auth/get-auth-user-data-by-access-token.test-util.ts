import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { AuthUserDataOutputDTO } from '../../../src/modules/user/api/auth/output-dto/auth-user-data.output-dto';

export const getAuthUserDataByAccessToken = async (
  app: NestExpressApplication,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<AuthUserDataOutputDTO> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_GET_AUTH_USER_DATA_BY_ACCESS_TOKEN_PATH}`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).get(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(testStatus);
  }

  return response.body as AuthUserDataOutputDTO;
};
