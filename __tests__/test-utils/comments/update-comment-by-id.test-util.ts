import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { UpdateCommentByIdInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-by-id.input-dto';
import { getUpdateCommentByIdInputDTO } from './input-dto-utils/get-update-comment-by-id-input-dto.test-util';

export const updateCommentById = async (
  app: NestExpressApplication,
  commentId: string,
  commentDTO?: Partial<UpdateCommentByIdInputDTO>,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<any> => {
  const testDTO: UpdateCommentByIdInputDTO = { ...getUpdateCommentByIdInputDTO(), ...commentDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.COMMENTS_PREFIX}/${commentId}`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).put(url).send(testDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .put(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testDTO)
      .expect(testStatus);
  }

  return response.body;
};
