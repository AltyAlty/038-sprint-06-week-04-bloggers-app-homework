import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';

export const deletePostByBlogByAndPostIdSA = async (
  app: NestExpressApplication,
  blogId: string,
  postId: string,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${blogId}/posts/${postId}`;
  let response: Response;

  if (noBasicAuthToken) {
    response = await request(app.getHttpServer()).delete(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .delete(url)
      .set('Authorization', basicAuthToken ?? createBasicAuthToken(app))
      .expect(testStatus);
  }

  return response.body;
};
