import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { AuthUserByLoginOrEmailInputDTO } from '../../../src/modules/user/api/auth/input-dto/auth-user-by-login-or-email.input-dto';
import { validUserAgents } from '../../test-data/auth.test-data';
import { getAuthUserByLoginOrEmailInputDTO } from './input-dto-utils/get-auth-user-by-login-or-email-input-dto.test-util';

export const authUserByLoginOrEmail = async (
  app: NestExpressApplication,
  authDTO?: Partial<AuthUserByLoginOrEmailInputDTO>,
  expectedStatus?: HttpStatus,
  noUserAgent?: boolean,
  userAgent?: any
): Promise<{ AT: string }> => {
  const testDTO: AuthUserByLoginOrEmailInputDTO = { ...getAuthUserByLoginOrEmailInputDTO(), ...authDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_AUTHENTICATE_USER_BY_LOGIN_OR_EMAIL_PATH}`;
  let response: Response;

  if (noUserAgent) {
    response = await request(app.getHttpServer()).post(url).send(testDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .post(url)
      .set('User-Agent', userAgent ?? validUserAgents.userAgent_01)
      .send(testDTO)
      .expect(testStatus);
  }

  const { accessToken } = response.body as { accessToken: string };
  return { AT: accessToken };
};
