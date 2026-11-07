import { NestExpressApplication } from '@nestjs/platform-express';
import { BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { createBlog } from '../../utils/blogs/create-blog.test-util';
import { getBlogById } from '../../utils/blogs/get-blog-by-id.test-util';
import { doBeforeTests } from '../../utils/common/do-before-tests.test-util';

describe('Blogs API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should create a blog; BlogsSaController 001. POST', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlog(testApp.app);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(testApp.app, createdBlog.id);
    expect(getBlogByIdResponse).toEqual(createdBlog);
  });
});
