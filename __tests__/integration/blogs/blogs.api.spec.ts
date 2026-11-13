import { NestExpressApplication } from '@nestjs/platform-express';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PostLikeStatusInputDTO } from '../../../src/modules/blog/api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogListOutputDTO, BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { PostListOutputDTO, PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { validBlogNames, validBlogsPaginationSettings } from '../../test-data/blogs.test-data';
import { validPostsPaginationSettings, validPostTitles } from '../../test-data/posts.test-data';
import { authUserByLoginOrEmail } from '../../test-utils/auth/auth-user-by-login-or-email.test-util';
import { createBlogSA } from '../../test-utils/blogs/create-blog-sa.test-util';
import { getBlogById } from '../../test-utils/blogs/get-blog-by-id.test-util';
import { getBlogList } from '../../test-utils/blogs/get-blog-list.test-util';
import { doBeforeTests } from '../../test-utils/common/do-before-tests.test-util';
import { createPostForBlogSA } from '../../test-utils/post/create-post-for-blog-sa.test-util';
import { getPostListByBlogId } from '../../test-utils/post/get-post-list-by-blog-id.test-util';
import { updatePostLikeStatusById } from '../../test-utils/post/update-post-like-status-by-id.test-util';
import { createConfirmedUserSA } from '../../test-utils/users/create-confirmed-user-sa.test-util';
import { getCreateUserInputDTO } from '../../test-utils/users/input-dto-utils/get-create-user-input-dto.test-util';

describe('Blogs API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should return a blog by a correct ID; BlogsController 001. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(testApp.app, createdBlog.id);
    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('✅ 002 should return a list of blogs; BlogsController 002. GET', async (): Promise<void> => {
    await Promise.all([createBlogSA(testApp.app), createBlogSA(testApp.app)]);
    const getBlogListResponse: PaginationMetaDataOutputDTO<BlogListOutputDTO> = await getBlogList(testApp.app);
    expect(getBlogListResponse.items).toBeInstanceOf(Array);
    expect(getBlogListResponse.items.length).toBe(2);
    expect(getBlogListResponse.totalCount).toBe(2);
  });

  it('✅ 003 should return a list of blogs when valid pagination settings passed; BlogsController 002. GET', async (): Promise<void> => {
    await Promise.all([
      createBlogSA(testApp.app, { name: validBlogNames.name_01 }),
      createBlogSA(testApp.app, { name: validBlogNames.name_02 }),
      createBlogSA(testApp.app, { name: validBlogNames.name_03 }),
      createBlogSA(testApp.app, { name: validBlogNames.name_04 }),
      createBlogSA(testApp.app, { name: validBlogNames.name_05 }),
      createBlogSA(testApp.app, { name: validBlogNames.name_06 }),
      createBlogSA(testApp.app),
      createBlogSA(testApp.app),
    ]);

    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_PREFIX}/${SETTINGS.BLOGS_GET_BLOG_LIST_PATH}?pageSize=${validBlogsPaginationSettings.pageSize}&pageNumber=${validBlogsPaginationSettings.pageNumber}&searchNameTerm=${validBlogsPaginationSettings.searchNameTerm}&sortDirection=${validBlogsPaginationSettings.sortDirection}&sortBy=${validBlogsPaginationSettings.sortBy}`;
    const getBlogListResponse: PaginationMetaDataOutputDTO<BlogListOutputDTO> = await getBlogList(testApp.app, url);
    expect(getBlogListResponse.items).toBeInstanceOf(Array);
    expect(getBlogListResponse.items.length).toBe(5);
    expect(getBlogListResponse.totalCount).toBe(6);
    expect(getBlogListResponse.items[0].name).toBe(validBlogNames.name_01);
    expect(getBlogListResponse.items[1].name).toBe(validBlogNames.name_02);
    expect(getBlogListResponse.items[2].name).toBe(validBlogNames.name_03);
    expect(getBlogListResponse.items[3].name).toBe(validBlogNames.name_04);
    expect(getBlogListResponse.items[4].name).toBe(validBlogNames.name_05);
  });

  it('✅ 004 should return a list of posts for a blog by a correct blog ID when a valid access token passed; BlogsController 003. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;
    const createdPostForBlog_01: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlogId);
    const createdPostForBlog_02: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlogId);
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlog_01.id,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlog_02.id,
      { likeStatus: PostLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getPostListByBlogIdResponse_01: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostListByBlogId(
      testApp.app,
      createdBlogId
    );

    const getPostListByBlogIdResponse_02: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostListByBlogId(
      testApp.app,
      createdBlogId,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    expect(getPostListByBlogIdResponse_01.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse_01.items.length).toBe(2);
    expect(getPostListByBlogIdResponse_01.totalCount).toBe(2);
    expect(getPostListByBlogIdResponse_01.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_01.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_02.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse_02.items.length).toBe(2);
    expect(getPostListByBlogIdResponse_02.totalCount).toBe(2);
    expect(getPostListByBlogIdResponse_02.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Dislike);
    expect(getPostListByBlogIdResponse_02.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
  });

  it('✅ 005 should return a list of posts for a blog by a correct blog ID when valid pagination settings and a valid access token passed; BlogsController 003. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;

    const createdPostForBlog_01: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlogId, {
      title: validPostTitles.title_01,
    });

    const createdPostForBlog_02: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlogId, {
      title: validPostTitles.title_02,
    });

    await Promise.all([
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_03 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_04 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_05 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_06 }),
      createPostForBlogSA(testApp.app, createdBlogId),
      createPostForBlogSA(testApp.app, createdBlogId),
    ]);

    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlog_01.id,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlog_02.id,
      { likeStatus: PostLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_PREFIX}/${createdBlogId}/posts?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;

    const getPostListByBlogIdResponse_01: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostListByBlogId(
      testApp.app,
      createdBlogId,
      url
    );

    const getPostListByBlogIdResponse_02: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostListByBlogId(
      testApp.app,
      createdBlogId,
      url,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    expect(getPostListByBlogIdResponse_01.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse_01.items.length).toBe(5);
    expect(getPostListByBlogIdResponse_01.totalCount).toBe(8);
    expect(getPostListByBlogIdResponse_01.items[0].title).toBe(validPostTitles.title_01);
    expect(getPostListByBlogIdResponse_01.items[1].title).toBe(validPostTitles.title_02);
    expect(getPostListByBlogIdResponse_01.items[2].title).toBe(validPostTitles.title_03);
    expect(getPostListByBlogIdResponse_01.items[3].title).toBe(validPostTitles.title_04);
    expect(getPostListByBlogIdResponse_01.items[4].title).toBe(validPostTitles.title_05);
    expect(getPostListByBlogIdResponse_01.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_01.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_01.items[2].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_01.items[3].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_01.items[4].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_02.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse_02.items.length).toBe(5);
    expect(getPostListByBlogIdResponse_02.totalCount).toBe(8);
    expect(getPostListByBlogIdResponse_02.items[0].title).toBe(validPostTitles.title_01);
    expect(getPostListByBlogIdResponse_02.items[1].title).toBe(validPostTitles.title_02);
    expect(getPostListByBlogIdResponse_02.items[2].title).toBe(validPostTitles.title_03);
    expect(getPostListByBlogIdResponse_02.items[3].title).toBe(validPostTitles.title_04);
    expect(getPostListByBlogIdResponse_02.items[4].title).toBe(validPostTitles.title_05);
    expect(getPostListByBlogIdResponse_02.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
    expect(getPostListByBlogIdResponse_02.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Dislike);
    expect(getPostListByBlogIdResponse_02.items[2].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_02.items[3].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListByBlogIdResponse_02.items[4].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
  });
});
