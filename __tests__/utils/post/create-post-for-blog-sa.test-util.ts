import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CreatePostForBlogInputDTO } from '../../../src/modules/blog/api/blogs/input-dto/create-post-for-blog.input-dto';
import { PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { createBasicAuthToken } from '../auth/create-basic-auth-token.test-util';
import { getCreatePostForBlogInputDTO } from './input-dto-utils/get-create-post-for-blog-input-dto.test-util';

export const createPostForBlogSA = async (
  app: NestExpressApplication,
  blogId: any,
  postDTO?: Partial<CreatePostForBlogInputDTO>,
  expectedStatus?: HttpStatus,
  noBasicAuthToken?: boolean,
  basicAuthToken?: any
): Promise<PostOutputDTO> => {
  const testDTO: CreatePostForBlogInputDTO = { ...getCreatePostForBlogInputDTO(), ...postDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.CREATED;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${blogId}/posts`;
  let response: Response;

  if (noBasicAuthToken) {
    response = await request(app.getHttpServer()).post(url).send(testDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .post(url)
      .set('Authorization', basicAuthToken ?? createBasicAuthToken(app))
      .send(testDTO)
      .expect(testStatus);
  }

  return response.body as PostOutputDTO;
};
