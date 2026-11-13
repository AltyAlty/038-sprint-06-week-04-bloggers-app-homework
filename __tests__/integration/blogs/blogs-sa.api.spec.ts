import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SETTINGS } from '../../../src/core/settings/settings';
import { UpdateBlogByIdInputDTO } from '../../../src/modules/blog/api/blogs/input-dto/update-blog-by-id.input-dto';
import { UpdatePostByBlogIdAndPostIdInputDTO } from '../../../src/modules/blog/api/blogs/input-dto/update-post-by-blog-id-and-post-id.input-dto';
import { CommentLikeStatusInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { PostLikeStatusInputDTO } from '../../../src/modules/blog/api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogListOutputDTO, BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { CommentOutputDTO } from '../../../src/modules/blog/api/comments/output-dto/comment.output-dto';
import { PostListOutputDTO, PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { validBlogNames, validBlogsPaginationSettings } from '../../test-data/blogs.test-data';
import { validPostsPaginationSettings, validPostTitles } from '../../test-data/posts.test-data';
import { authUserByLoginOrEmail } from '../../test-utils/auth/auth-user-by-login-or-email.test-util';
import { createBlogSA } from '../../test-utils/blogs/create-blog-sa.test-util';
import { deleteBlogByIdSA } from '../../test-utils/blogs/delete-blog-by-id-sa.test-util';
import { getBlogById } from '../../test-utils/blogs/get-blog-by-id.test-util';
import { getBlogListSA } from '../../test-utils/blogs/get-blog-list-sa.test-util';
import { getUpdateBlogByIdInputDTO } from '../../test-utils/blogs/input-dto-utils/get-update-blog-by-id-input-dto.test-util';
import { updateBlogByIdSA } from '../../test-utils/blogs/update-blog-by-id-sa.test-util';
import { createCommentForPost } from '../../test-utils/comments/create-comment-for-post.test-util';
import { getCommentById } from '../../test-utils/comments/get-comment-by-id.test-util';
import { hasAnyCommentLikeDataByCommentId } from '../../test-utils/comments/has-any-comment-like-data-by-comment-id.test-util';
import { updateCommentLikeStatusById } from '../../test-utils/comments/update-comment-like-status-by-id.test-util';
import { doBeforeTests } from '../../test-utils/common/do-before-tests.test-util';
import { createPostForBlogSA } from '../../test-utils/post/create-post-for-blog-sa.test-util';
import { deletePostByBlogByAndPostIdSA } from '../../test-utils/post/delete-post-by-blog-by-and-post-id-sa.test-util';
import { getPostById } from '../../test-utils/post/get-post-by-id.test-util';
import { getPostListByBlogIdSA } from '../../test-utils/post/get-post-list-by-blog-id-sa.test-util';
import { hasPostLikesDataByPostId } from '../../test-utils/post/has-post-likes-data-by-post-id.test-util';
import { getUpdatePostByBlogIdAndPostIdInputDTO } from '../../test-utils/post/input-dto-utils/get-update-post-by-blog-id-and-post-id-input-dto.test-util';
import { updatePostByBlogIdAndPostIdSA } from '../../test-utils/post/update-post-by-blog-id-and-post-id-sa.test-util';
import { updatePostLikeStatusById } from '../../test-utils/post/update-post-like-status-by-id.test-util';
import { createConfirmedUserSA } from '../../test-utils/users/create-confirmed-user-sa.test-util';
import { getCreateUserInputDTO } from '../../test-utils/users/input-dto-utils/get-create-user-input-dto.test-util';

describe('Blogs SA API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should create a blog when a valid basic auth token passed; BlogsSaController 001. POST', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(testApp.app, createdBlog.id);
    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('✅ 002 should create a post for a blog by a correct blog ID when a valid basic auth token passed; BlogsSaController 002. POST', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const getPostByIdResponse: PostOutputDTO = await getPostById(testApp.app, createdPostForBlog.id);
    expect(getPostByIdResponse).toEqual(createdPostForBlog);
  });

  it('✅ 003 should return a list of blogs when a valid basic auth token passed; BlogsSaController 003. GET', async (): Promise<void> => {
    await Promise.all([createBlogSA(testApp.app), createBlogSA(testApp.app)]);
    const getBlogListResponse: PaginationMetaDataOutputDTO<BlogListOutputDTO> = await getBlogListSA(testApp.app);
    expect(getBlogListResponse.items).toBeInstanceOf(Array);
    expect(getBlogListResponse.items.length).toBe(2);
    expect(getBlogListResponse.totalCount).toBe(2);
  });

  it('✅ 004 should return a list of blogs when valid pagination settings and a valid basic auth token passed; BlogsSaController 003. GET', async (): Promise<void> => {
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

    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${SETTINGS.BLOGS_SA_GET_BLOG_LIST_PATH}?pageSize=${validBlogsPaginationSettings.pageSize}&pageNumber=${validBlogsPaginationSettings.pageNumber}&searchNameTerm=${validBlogsPaginationSettings.searchNameTerm}&sortDirection=${validBlogsPaginationSettings.sortDirection}&sortBy=${validBlogsPaginationSettings.sortBy}`;
    const getBlogListResponse: PaginationMetaDataOutputDTO<BlogListOutputDTO> = await getBlogListSA(testApp.app, url);
    expect(getBlogListResponse.items).toBeInstanceOf(Array);
    expect(getBlogListResponse.items.length).toBe(5);
    expect(getBlogListResponse.totalCount).toBe(6);
    expect(getBlogListResponse.items[0].name).toBe(validBlogNames.name_01);
    expect(getBlogListResponse.items[1].name).toBe(validBlogNames.name_02);
    expect(getBlogListResponse.items[2].name).toBe(validBlogNames.name_03);
    expect(getBlogListResponse.items[3].name).toBe(validBlogNames.name_04);
    expect(getBlogListResponse.items[4].name).toBe(validBlogNames.name_05);
  });

  it('✅ 005 should return a list of posts for a blog by a correct blog ID when a valid basic auth token passed; BlogsSaController 004. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;

    await Promise.all([
      createPostForBlogSA(testApp.app, createdBlogId),
      createPostForBlogSA(testApp.app, createdBlogId),
    ]);

    const getPostListByBlogIdResponse: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostListByBlogIdSA(
      testApp.app,
      createdBlogId
    );

    expect(getPostListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse.items.length).toBe(2);
    expect(getPostListByBlogIdResponse.totalCount).toBe(2);
  });

  it('✅ 006 should return a list of posts for a blog by a correct blog ID when valid pagination settings and a valid basic auth token passed; BlogsSaController 004. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;

    await Promise.all([
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_01 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_02 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_03 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_04 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_05 }),
      createPostForBlogSA(testApp.app, createdBlogId, { title: validPostTitles.title_06 }),
      createPostForBlogSA(testApp.app, createdBlogId),
      createPostForBlogSA(testApp.app, createdBlogId),
    ]);

    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.BLOGS_SA_PREFIX}/${createdBlogId}/posts?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;

    const getPostListByBlogIdResponse: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostListByBlogIdSA(
      testApp.app,
      createdBlogId,
      url
    );

    expect(getPostListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostListByBlogIdResponse.items.length).toBe(5);
    expect(getPostListByBlogIdResponse.totalCount).toBe(8);
    expect(getPostListByBlogIdResponse.items[0].title).toBe(validPostTitles.title_01);
    expect(getPostListByBlogIdResponse.items[1].title).toBe(validPostTitles.title_02);
    expect(getPostListByBlogIdResponse.items[2].title).toBe(validPostTitles.title_03);
    expect(getPostListByBlogIdResponse.items[3].title).toBe(validPostTitles.title_04);
    expect(getPostListByBlogIdResponse.items[4].title).toBe(validPostTitles.title_05);
  });

  it('✅ 007 should update a blog by a correct ID when a valid basic auth token passed; BlogsSaController 005. PUT', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;
    const updateBlogByIdInputDTO: UpdateBlogByIdInputDTO = getUpdateBlogByIdInputDTO();
    await updateBlogByIdSA(testApp.app, createdBlogId, updateBlogByIdInputDTO);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(testApp.app, createdBlogId);

    expect(getBlogByIdResponse).toEqual({
      id: createdBlogId,
      name: updateBlogByIdInputDTO.name,
      description: updateBlogByIdInputDTO.description,
      websiteUrl: updateBlogByIdInputDTO.websiteUrl,
      createdAt: createdBlog.createdAt,
      isMembership: createdBlog.isMembership,
    });
  });

  it('✅ 008 should update a post by correct blog and post IDs when a valid basic auth token passed; BlogsSaController 006. PUT', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlogId);
    const createdPostForBlogId: string = createdPostForBlog.id;

    const updatePostByBlogIdAndPostIdInputDTO: UpdatePostByBlogIdAndPostIdInputDTO =
      getUpdatePostByBlogIdAndPostIdInputDTO();

    await updatePostByBlogIdAndPostIdSA(testApp.app, createdBlogId, createdPostForBlogId);
    const getPostByIdResponse: PostOutputDTO = await getPostById(testApp.app, createdPostForBlogId);

    expect(getPostByIdResponse).toEqual({
      id: createdPostForBlogId,
      title: updatePostByBlogIdAndPostIdInputDTO.title,
      shortDescription: updatePostByBlogIdAndPostIdInputDTO.shortDescription,
      content: updatePostByBlogIdAndPostIdInputDTO.content,
      blogId: createdBlogId,
      blogName: createdBlog.name,
      createdAt: createdPostForBlog.createdAt,
      extendedLikesInfo: { dislikesCount: 0, likesCount: 0, myStatus: 'None', newestLikes: [] },
    });
  });

  it("✅ 009 should delete a blog with its posts, posts' likes, comments and comments' likes by a correct ID when a valid basic auth token passed; BlogsSaController 007. DELETE", async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlogId);
    const createdPostForBlogId: string = createdPostForBlog.id;
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    const createdCommentForPost: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const createdCommentForPostId: string = createdCommentForPost.id;

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await deleteBlogByIdSA(testApp.app, createdBlogId);
    await getBlogById(testApp.app, createdBlogId, HttpStatus.NOT_FOUND);
    await getPostById(testApp.app, createdPostForBlogId, HttpStatus.NOT_FOUND);
    expect(await hasPostLikesDataByPostId(testApp.app, createdPostForBlogId)).toBe(false);
    await getCommentById(testApp.app, createdCommentForPostId, HttpStatus.NOT_FOUND);
    expect(await hasAnyCommentLikeDataByCommentId(testApp.app, createdCommentForPostId)).toBe(false);
  });

  it("✅ 010 should delete a post with its likes, its comments and comments' likes by correct blog and post IDs when a valid basic auth token passed; BlogsSaController 008. DELETE", async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdBlogId: string = createdBlog.id;
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlogId);
    const createdPostForBlogId: string = createdPostForBlog.id;
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    const createdCommentForPost: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const createdCommentForPostId: string = createdCommentForPost.id;

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await deletePostByBlogByAndPostIdSA(testApp.app, createdBlogId, createdPostForBlogId);
    await getPostById(testApp.app, createdPostForBlogId, HttpStatus.NOT_FOUND);
    expect(await hasPostLikesDataByPostId(testApp.app, createdPostForBlogId)).toBe(false);
    await getCommentById(testApp.app, createdCommentForPostId, HttpStatus.NOT_FOUND);
    expect(await hasAnyCommentLikeDataByCommentId(testApp.app, createdCommentForPostId)).toBe(false);
  });
});
