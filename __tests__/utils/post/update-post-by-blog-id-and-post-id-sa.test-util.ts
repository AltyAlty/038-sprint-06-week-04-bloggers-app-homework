import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { UpdatePostByBlogIdAndPostIdInputDTO } from '../../../src/modules/blog/api/blogs/input-dto/update-post-by-blog-id-and-post-id.input-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';
import { getUpdatePostByBlogIdAndPostIdInputDTO } from './input-dto-utils/get-update-post-by-blog-id-and-post-id-input-dto.test-util';

export const updatePostByBlogIdAndPostIdSA = async (
  app: NestExpressApplication,
  blogId: string,
  postId: string,
  postDTO?: Partial<UpdatePostByBlogIdAndPostIdInputDTO>,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<any> => {
  const testDTO: UpdatePostByBlogIdAndPostIdInputDTO = { ...getUpdatePostByBlogIdAndPostIdInputDTO(), ...postDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${blogId}/posts/${postId}`;
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
