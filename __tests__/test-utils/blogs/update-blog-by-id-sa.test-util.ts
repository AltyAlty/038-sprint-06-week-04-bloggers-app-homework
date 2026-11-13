import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { UpdateBlogByIdInputDTO } from '../../../src/modules/blog/api/blogs/input-dto/update-blog-by-id.input-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';
import { getUpdateBlogByIdInputDTO } from './input-dto-utils/get-update-blog-by-id-input-dto.test-util';

export const updateBlogByIdSA = async (
  app: NestExpressApplication,
  blogId: string,
  blogDTO?: Partial<UpdateBlogByIdInputDTO>,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<any> => {
  const testDTO: UpdateBlogByIdInputDTO = { ...getUpdateBlogByIdInputDTO(), ...blogDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${blogId}`;
  let response: Response;

  if (noBasicAuthToken) {
    response = await request(app.getHttpServer()).put(url).send(testDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .put(url)
      .set('Authorization', basicAuthToken ?? createBasicAuthToken(app))
      .send(testDTO)
      .expect(testStatus);
  }

  return response.body;
};
