import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { UpdateCommentLikeStatusByIdInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-like-status-by-id.input-dto';

export const updateCommentLikeStatusById = async (
  app: NestExpressApplication,
  commentId: any,
  commentLikeStatusDTO: UpdateCommentLikeStatusByIdInputDTO,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.COMMENTS_PREFIX}/${commentId}/like-status`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).put(url).send(commentLikeStatusDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .put(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(commentLikeStatusDTO)
      .expect(testStatus);
  }

  return response.body;
};
