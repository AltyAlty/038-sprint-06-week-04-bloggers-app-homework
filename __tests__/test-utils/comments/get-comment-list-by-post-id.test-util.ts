import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { CommentListOutputDTO } from '../../../src/modules/blog/api/comments/output-dto/comment.output-dto';

export const getCommentListByPostId = async (
  app: NestExpressApplication,
  postId: string,
  urlWithPagination?: string,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<PaginationMetaDataOutputDTO<CommentListOutputDTO>> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  const url: string = urlWithPagination ?? `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.POSTS_PREFIX}/${postId}/comments`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).get(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(testStatus);
  }

  return response.body as PaginationMetaDataOutputDTO<CommentListOutputDTO>;
};
