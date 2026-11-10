import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';

export const getPostById = async (
  app: NestExpressApplication,
  postId: any,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<PostOutputDTO> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.POSTS_PREFIX}/${postId}`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).get(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(testStatus);
  }

  return response.body as PostOutputDTO;
};
