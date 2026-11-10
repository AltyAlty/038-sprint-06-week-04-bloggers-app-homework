import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { UserListOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';

export const getUserListSA = async (
  app: NestExpressApplication,
  urlWithPagination?: string,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<PaginationMetaDataOutputDTO<UserListOutputDTO>> => {
  const url: string =
    urlWithPagination ??
    `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.USERS_SA_PREFIX}/${SETTINGS.USERS_SA_GET_USER_LIST_PATH}`;

  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  let response: Response;

  if (noBasicAuthToken) {
    response = await request(app.getHttpServer()).get(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .get(url)
      .set('Authorization', basicAuthToken ?? createBasicAuthToken(app))
      .expect(testStatus);
  }

  return response.body as PaginationMetaDataOutputDTO<UserListOutputDTO>;
};
