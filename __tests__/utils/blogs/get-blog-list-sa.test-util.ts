import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogListOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';

export const getBlogListSA = async (
  app: NestExpressApplication,
  urlWithPagination?: string,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<PaginationMetaDataOutputDTO<BlogListOutputDTO>> => {
  const url: string =
    urlWithPagination ??
    `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${SETTINGS.BLOGS_SA_GET_BLOG_LIST_PATH}`;

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

  return response.body as PaginationMetaDataOutputDTO<BlogListOutputDTO>;
};
