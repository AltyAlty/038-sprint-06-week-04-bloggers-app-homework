import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { SendPasswordRecoveryCodeInputDTO } from '../../../src/modules/user/api/auth/input-dto/send-password-recovery-code.input-dto';
import { getSendPasswordRecoveryCodeInputDTO } from './input-dto-utils/get-send-password-recovery-code-input-dto.test-util';

export const sendPasswordRecoveryCode = async (
  app: NestExpressApplication,
  resendConfirmationEmailDTO?: Partial<SendPasswordRecoveryCodeInputDTO>,
  expectedStatus?: HttpStatus
): Promise<any> => {
  const testDTO: SendPasswordRecoveryCodeInputDTO = {
    ...getSendPasswordRecoveryCodeInputDTO(),
    ...resendConfirmationEmailDTO,
  };

  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_SEND_PASSWORD_RECOVERY_CODE_PATH}`;
  const response: Response = await request(app.getHttpServer()).post(url).send(testDTO).expect(testStatus);
  return response.body;
};
