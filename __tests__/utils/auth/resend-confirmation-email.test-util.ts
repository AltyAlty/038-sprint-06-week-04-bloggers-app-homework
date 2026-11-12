import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { ResendConfirmationEmailInputDTO } from '../../../src/modules/user/api/auth/input-dto/resend-confirmation-email.input-dto';
import { getResendConfirmationEmailInputDTO } from './input-dto-utils/get-resend-confirmation-email-input-dto.test-util';

export const resendConfirmationEmail = async (
  app: NestExpressApplication,
  resendConfirmationEmailDTO?: Partial<ResendConfirmationEmailInputDTO>,
  expectedStatus?: HttpStatus
): Promise<any> => {
  const testDTO: ResendConfirmationEmailInputDTO = {
    ...getResendConfirmationEmailInputDTO(),
    ...resendConfirmationEmailDTO,
  };

  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_RESEND_CONFIRMATION_EMAIL_PATH}`;
  const response: Response = await request(app.getHttpServer()).post(url).send(testDTO).expect(testStatus);
  return response.body;
};
