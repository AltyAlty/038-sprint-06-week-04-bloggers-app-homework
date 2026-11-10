import { UpdateCommentByIdInputDTO } from '../../../../src/modules/blog/api/comments/input-dto/update-comment-by-id.input-dto';

export const getUpdateCommentByIdInputDTO = (): UpdateCommentByIdInputDTO => {
  return { content: 'some updated comment content 001' };
};
