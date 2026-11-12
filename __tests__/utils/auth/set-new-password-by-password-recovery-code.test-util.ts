import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { SetNewPasswordByPasswordRecoveryCodeInputDTO } from '../../../src/modules/user/api/auth/input-dto/set-new-password-by-password-recovery-code.input-dto';

export const setNewPasswordByPasswordRecoveryCode = async (
  app: NestExpressApplication,
  setNewPasswordByPasswordRecoveryCodeDTO?: Partial<SetNewPasswordByPasswordRecoveryCodeInputDTO>,
  expectedStatus?: HttpStatus
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_UPDATE_PASSWORD_BY_PASSWORD_RECOVERY_CODE_PATH}`;

  const response: Response = await request(app.getHttpServer())
    .post(url)
    .send(setNewPasswordByPasswordRecoveryCodeDTO)
    .expect(testStatus);

  return response.body;
};
