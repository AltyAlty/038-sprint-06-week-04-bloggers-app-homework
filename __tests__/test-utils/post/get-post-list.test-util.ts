import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostListOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';

export const getPostList = async (
  app: NestExpressApplication,
  urlWithPagination?: string,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;

  const url: string =
    urlWithPagination ?? `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.POSTS_PREFIX}/${SETTINGS.POSTS_GET_POST_LIST_PATH}`;

  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).get(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(testStatus);
  }

  return response.body as PaginationMetaDataOutputDTO<PostListOutputDTO>;
};
