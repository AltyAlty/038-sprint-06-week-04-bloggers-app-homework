import { UpdatePostByBlogIdAndPostIdInputDTO } from '../../../../src/modules/blog/api/blogs/input-dto/update-post-by-blog-id-and-post-id.input-dto';

export const getUpdatePostByBlogIdAndPostIdInputDTO = (): UpdatePostByBlogIdAndPostIdInputDTO => {
  return {
    title: 'upd title 01',
    shortDescription: 'upd shortDescription 01',
    content: 'upd content 01',
  };
};
