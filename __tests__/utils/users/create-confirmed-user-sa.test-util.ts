import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { UserOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';
import { getCreateUserInputDTO } from './input-dto-utils/get-create-user-input-dto.test-util';

export const createConfirmedUserSA = async (
  app: NestExpressApplication,
  userDTO?: Partial<CreateUserInputDTO>,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<UserOutputDTO> => {
  const testDTO: CreateUserInputDTO = { ...getCreateUserInputDTO(), ...userDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.CREATED;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.USERS_SA_PREFIX}/${SETTINGS.USERS_SA_CREATE_CONFIRMED_USER_PATH}`;
  let response: Response;

  if (noBasicAuthToken) {
    response = await request(app.getHttpServer()).post(url).send(testDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .post(url)
      .set('Authorization', basicAuthToken ?? createBasicAuthToken(app))
      .send(testDTO)
      .expect(testStatus);
  }

  return response.body as UserOutputDTO;
};
