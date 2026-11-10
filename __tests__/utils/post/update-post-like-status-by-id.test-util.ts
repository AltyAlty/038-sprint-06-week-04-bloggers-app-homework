import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { UpdatePostLikeStatusByIdInputDTO } from '../../../src/modules/blog/api/posts/input-dto/update-post-like-status-by-id.input-dto';

export const updatePostLikeStatusById = async (
  app: NestExpressApplication,
  postId: any,
  postLikeStatusDTO: UpdatePostLikeStatusByIdInputDTO,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.POSTS_PREFIX}/${postId}/like-status`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).put(url).send(postLikeStatusDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .put(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(postLikeStatusDTO)
      .expect(testStatus);
  }

  return response.body;
};
