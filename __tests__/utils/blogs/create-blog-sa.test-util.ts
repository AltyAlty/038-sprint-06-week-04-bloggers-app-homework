import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CreateBlogInputDTO } from '../../../src/modules/blog/api/blogs/input-dto/create-blog.input-dto';
import { BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';
import { getCreateBlogInputDTO } from './input-dto-utils/get-create-blog-input-dto.test-util';

export const createBlogSA = async (
  app: NestExpressApplication,
  blogDTO?: Partial<CreateBlogInputDTO>,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<BlogOutputDTO> => {
  const testDTO: CreateBlogInputDTO = { ...getCreateBlogInputDTO(), ...blogDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.CREATED;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${SETTINGS.BLOGS_SA_CREATE_BLOG_PATH}`;
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

  return response.body as BlogOutputDTO;
};
