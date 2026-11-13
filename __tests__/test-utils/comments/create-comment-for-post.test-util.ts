import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CreateCommentForPostInputDTO } from '../../../src/modules/blog/api/posts/input-dto/create-comment-for-post.input-dto';
import { CommentOutputDTO } from '../../../src/modules/blog/api/comments/output-dto/comment.output-dto';
import { getCreateCommentForPostInputDTO } from './input-dto-utils/get-create-comment-for-post-input-dto.test-util';

export const createCommentForPost = async (
  app: NestExpressApplication,
  postId: any,
  commentDTO?: Partial<CreateCommentForPostInputDTO>,
  expectedStatus?: HttpStatus,
  noAccessToken?: boolean,
  accessToken?: any
): Promise<CommentOutputDTO> => {
  const testDTO: CreateCommentForPostInputDTO = { ...getCreateCommentForPostInputDTO(), ...commentDTO };
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.CREATED;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.POSTS_PREFIX}/${postId}/comments`;
  let response: Response;

  if (noAccessToken) {
    response = await request(app.getHttpServer()).post(url).send(testDTO).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testDTO)
      .expect(testStatus);
  }

  return response.body as CommentOutputDTO;
};
