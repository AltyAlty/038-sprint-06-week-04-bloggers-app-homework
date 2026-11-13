import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostListOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';

export const getPostListByBlogIdSA = async (
  app: NestExpressApplication,
  blogId: string,
  urlWithPagination?: string,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> => {
  const url: string = urlWithPagination ?? `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${blogId}/posts`;
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  let response: Response;

  if (noBasicAuthToken) {
    response = await request(app.getHttpServer()).get(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .get(url)
      .set('Authorization', basicAuthToken ?? createBasicAuthToken(app))
      .expect(testStatus);
  }

  return response.body as PaginationMetaDataOutputDTO<PostListOutputDTO>;
};
