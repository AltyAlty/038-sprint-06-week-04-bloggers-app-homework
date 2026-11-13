import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { RegisterUserInputDTO } from '../../../src/modules/user/api/auth/input-dto/register-user.input-dto';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { getCreateUserInputDTO } from '../users/input-dto-utils/get-create-user-input-dto.test-util';

export const registerUser = async (
  app: NestExpressApplication,
  registerUserDTO?: Partial<RegisterUserInputDTO>,
  expectedStatus?: HttpStatus
): Promise<any> => {
  const testDTO: CreateUserInputDTO = { ...getCreateUserInputDTO(), ...registerUserDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.AUTH_PREFIX}/${SETTINGS.AUTH_REGISTER_USER_PATH}`;
  const response: Response = await request(app.getHttpServer()).post(url).send(testDTO).expect(testStatus);
  return response.body;
};
