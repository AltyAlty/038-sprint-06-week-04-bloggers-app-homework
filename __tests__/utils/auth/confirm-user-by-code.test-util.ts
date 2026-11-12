import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { ConfirmUserByCodeInputDTO } from '../../../src/modules/user/api/auth/input-dto/confirm-user-by-code.input-dto';

export const confirmUserByCode = async (
  app: NestExpressApplication,
  confirmUserByCodeDTO?: Partial<ConfirmUserByCodeInputDTO>,
  expectedStatus?: HttpStatus
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_CONFIRM_USER_BY_CODE_PATH}`;
  const response: Response = await request(app.getHttpServer()).post(url).send(confirmUserByCodeDTO).expect(testStatus);
  return response.body;
};
