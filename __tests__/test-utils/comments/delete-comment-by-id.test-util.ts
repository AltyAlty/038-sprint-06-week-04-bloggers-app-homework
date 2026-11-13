import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';

export const deleteCommentById = async (
  app: NestExpressApplication,
  commentId: string,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<any> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.NO_CONTENT;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.COMMENTS_PREFIX}/${commentId}`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).delete(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .delete(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(testStatus);
  }

  return response.body;
};
