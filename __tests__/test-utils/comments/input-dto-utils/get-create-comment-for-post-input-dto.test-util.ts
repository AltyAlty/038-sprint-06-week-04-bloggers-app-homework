import { CreateCommentForPostInputDTO } from '../../../../src/modules/blog/api/posts/input-dto/create-comment-for-post.input-dto';

export const getCreateCommentForPostInputDTO = (): CreateCommentForPostInputDTO => {
  return { content: 'some comment content 001' };
};
