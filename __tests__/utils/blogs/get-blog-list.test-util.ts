import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogListOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';

export const getBlogList = async (
  app: NestExpressApplication,
  urlWithPagination?: string,
  expectedStatus?: HttpStatus
): Promise<PaginationMetaDataOutputDTO<BlogListOutputDTO>> => {
  const response: Response = await request(app.getHttpServer())
    .get(
      urlWithPagination ?? `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_PREFIX}/${SETTINGS.BLOGS_GET_BLOG_LIST_PATH}`
    )
    .expect(expectedStatus ?? HttpStatus.OK);

  return response.body as PaginationMetaDataOutputDTO<BlogListOutputDTO>;
};
