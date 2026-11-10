import { CreatePostForBlogInputDTO } from '../../../../src/modules/blog/api/blogs/input-dto/create-post-for-blog.input-dto';

export const getCreatePostForBlogInputDTO = (): CreatePostForBlogInputDTO => {
  return {
    title: 'title 01',
    shortDescription: 'shortDescription 01',
    content: 'content 01',
  };
};
