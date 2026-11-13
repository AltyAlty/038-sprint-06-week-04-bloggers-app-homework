import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';

export const getBlogById = async (
  app: NestExpressApplication,
  blogId: any,
  expectedStatus?: HttpStatus
): Promise<BlogOutputDTO> => {
  const response: Response = await request(app.getHttpServer())
    .get(`/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_PREFIX}/${blogId}`)
    .expect(expectedStatus ?? HttpStatus.OK);

  return response.body as BlogOutputDTO;
};
