import { NestExpressApplication } from '@nestjs/platform-express';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CommentLikeStatusInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { PostLikeStatusInputDTO } from '../../../src/modules/blog/api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import {
  CommentListOutputDTO,
  CommentOutputDTO,
} from '../../../src/modules/blog/api/comments/output-dto/comment.output-dto';
import { PostListOutputDTO, PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { UserOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { validCommentContents, validCommentsPaginationSettings } from '../../test-data/comments.test-data';
import { validPostsPaginationSettings, validPostTitles } from '../../test-data/posts.test-data';
import { validUserEmails, validUserLogins, validUserPasswords } from '../../test-data/users.test-data';
import { authUserByLoginOrEmail } from '../../utils/auth/auth-user-by-login-or-email.test-util';
import { createBlogSA } from '../../utils/blogs/create-blog-sa.test-util';
import { createCommentForPost } from '../../utils/comments/create-comment-for-post.test-util';
import { getCommentById } from '../../utils/comments/get-comment-by-id.test-util';
import { getCommentListByPostId } from '../../utils/comments/get-comment-list-by-post-id.test-util';
import { updateCommentLikeStatusById } from '../../utils/comments/update-comment-like-status-by-id.test-util';
import { doBeforeTests } from '../../utils/common/do-before-tests.test-util';
import { createPostForBlogSA } from '../../utils/post/create-post-for-blog-sa.test-util';
import { getPostById } from '../../utils/post/get-post-by-id.test-util';
import { getPostList } from '../../utils/post/get-post-list.test-util';
import { updatePostLikeStatusById } from '../../utils/post/update-post-like-status-by-id.test-util';
import { createConfirmedUserSA } from '../../utils/users/create-confirmed-user-sa.test-util';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';

describe('Posts API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should create a comment for a post by a correct ID when a valid access token passed; PostsController 001. POST', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    const createdConfirmedUser: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    const createdCommentForPost: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlog.id,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(testApp.app, createdCommentForPost.id);
    expect(getCommentByIdResponse).toEqual(createdCommentForPost);
    expect(getCommentByIdResponse.commentatorInfo.userId).toBe(createdConfirmedUser.id);
    expect(getCommentByIdResponse.commentatorInfo.userLogin).toBe(createdConfirmedUser.login);
  });

  it('✅ 002 should return a post by a correct ID when a valid access token passed; PostsController 002. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createdPostForBlogId: string = createdPostForBlog.id;
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    const getPostByIdResponse_01: PostOutputDTO = await getPostById(testApp.app, createdPostForBlogId);

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getPostByIdResponse_02: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    expect(getPostByIdResponse_01).toEqual(createdPostForBlog);
    expect(getPostByIdResponse_01.extendedLikesInfo.myStatus).toEqual(PostLikeStatusInputDTO.None);
    expect(getPostByIdResponse_02).not.toEqual(createdPostForBlog);
    expect(getPostByIdResponse_02.extendedLikesInfo.myStatus).toEqual(PostLikeStatusInputDTO.Like);
  });

  it('✅ 003 should return a list of posts when a valid access token passed; PostsController 003. GET', async (): Promise<void> => {
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

    const getPostListResponse_01: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostList(testApp.app);

    const getPostListResponse_02: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostList(
      testApp.app,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    expect(getPostListResponse_01.items).toBeInstanceOf(Array);
    expect(getPostListResponse_01.items.length).toBe(2);
    expect(getPostListResponse_01.totalCount).toBe(2);
    expect(getPostListResponse_01.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_01.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_02.items).toBeInstanceOf(Array);
    expect(getPostListResponse_02.items.length).toBe(2);
    expect(getPostListResponse_02.totalCount).toBe(2);
    expect(getPostListResponse_02.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Dislike);
    expect(getPostListResponse_02.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
  });

  it('✅ 004 should return a list of posts when valid pagination settings and a valid access token passed; PostsController 003. GET', async (): Promise<void> => {
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

    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.POSTS_PREFIX}/${SETTINGS.POSTS_GET_POST_LIST_PATH}?pageSize=${validPostsPaginationSettings.pageSize}&pageNumber=${validPostsPaginationSettings.pageNumber}&sortDirection=${validPostsPaginationSettings.sortDirection}&sortBy=${validPostsPaginationSettings.sortBy}`;
    const getPostListResponse_01: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostList(testApp.app, url);

    const getPostListResponse_02: PaginationMetaDataOutputDTO<PostListOutputDTO> = await getPostList(
      testApp.app,
      url,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    expect(getPostListResponse_01.items).toBeInstanceOf(Array);
    expect(getPostListResponse_01.items.length).toBe(5);
    expect(getPostListResponse_01.totalCount).toBe(8);
    expect(getPostListResponse_01.items[0].title).toBe(validPostTitles.title_01);
    expect(getPostListResponse_01.items[1].title).toBe(validPostTitles.title_02);
    expect(getPostListResponse_01.items[2].title).toBe(validPostTitles.title_03);
    expect(getPostListResponse_01.items[3].title).toBe(validPostTitles.title_04);
    expect(getPostListResponse_01.items[4].title).toBe(validPostTitles.title_05);
    expect(getPostListResponse_01.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_01.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_01.items[2].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_01.items[3].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_01.items[4].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_02.items).toBeInstanceOf(Array);
    expect(getPostListResponse_02.items.length).toBe(5);
    expect(getPostListResponse_02.totalCount).toBe(8);
    expect(getPostListResponse_02.items[0].title).toBe(validPostTitles.title_01);
    expect(getPostListResponse_02.items[1].title).toBe(validPostTitles.title_02);
    expect(getPostListResponse_02.items[2].title).toBe(validPostTitles.title_03);
    expect(getPostListResponse_02.items[3].title).toBe(validPostTitles.title_04);
    expect(getPostListResponse_02.items[4].title).toBe(validPostTitles.title_05);
    expect(getPostListResponse_02.items[0].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
    expect(getPostListResponse_02.items[1].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Dislike);
    expect(getPostListResponse_02.items[2].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_02.items[3].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostListResponse_02.items[4].extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
  });

  it('✅ 005 should return a list of comments for a post by a correct post ID when a valid access token passed; PostsController 004. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createdPostForBlogId: string = createdPostForBlog.id;
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO.login,
      password: createUserInputDTO.password,
    });

    const createdCommentForPost_01: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const createdCommentForPost_02: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPost_01.id,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPost_02.id,
      { likeStatus: CommentLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getCommentListByPostIdResponse_01: PaginationMetaDataOutputDTO<CommentListOutputDTO> =
      await getCommentListByPostId(testApp.app, createdPostForBlogId);

    const getCommentListByPostIdResponse_02: PaginationMetaDataOutputDTO<CommentListOutputDTO> =
      await getCommentListByPostId(
        testApp.app,
        createdPostForBlogId,
        undefined,
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      );

    expect(getCommentListByPostIdResponse_01.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse_01.items.length).toBe(2);
    expect(getCommentListByPostIdResponse_01.totalCount).toBe(2);
    expect(getCommentListByPostIdResponse_01.items[0].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_01.items[1].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_02.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse_02.items.length).toBe(2);
    expect(getCommentListByPostIdResponse_02.totalCount).toBe(2);
    expect(getCommentListByPostIdResponse_02.items[0].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.Dislike);
    expect(getCommentListByPostIdResponse_02.items[1].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
  });

  it('✅ 006 should return a list of comments for a post by a correct post ID when valid pagination settings and a valid access token passed; PostsController 004. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createdPostForBlogId: string = createdPostForBlog.id;
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    const createdCommentForPost_01: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      { content: validCommentContents.content_01 },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const createdCommentForPost_02: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      { content: validCommentContents.content_02 },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await Promise.all([
      createCommentForPost(
        testApp.app,
        createdPostForBlogId,
        { content: validCommentContents.content_03 },
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      ),
      createCommentForPost(
        testApp.app,
        createdPostForBlogId,
        { content: validCommentContents.content_04 },
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      ),
      createCommentForPost(
        testApp.app,
        createdPostForBlogId,
        { content: validCommentContents.content_05 },
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      ),
      createCommentForPost(
        testApp.app,
        createdPostForBlogId,
        { content: validCommentContents.content_06 },
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      ),
      createCommentForPost(
        testApp.app,
        createdPostForBlogId,
        undefined,
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      ),
      createCommentForPost(
        testApp.app,
        createdPostForBlogId,
        undefined,
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      ),
    ]);

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPost_01.id,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPost_02.id,
      { likeStatus: CommentLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.POSTS_PREFIX}/${createdPostForBlogId}/comments?pageSize=${validCommentsPaginationSettings.pageSize}&pageNumber=${validCommentsPaginationSettings.pageNumber}&sortDirection=${validCommentsPaginationSettings.sortDirection}&sortBy=${validCommentsPaginationSettings.sortBy}`;

    const getCommentListByPostIdResponse_01: PaginationMetaDataOutputDTO<CommentListOutputDTO> =
      await getCommentListByPostId(testApp.app, createdPostForBlogId, url);

    const getCommentListByPostIdResponse_02: PaginationMetaDataOutputDTO<CommentListOutputDTO> =
      await getCommentListByPostId(
        testApp.app,
        createdPostForBlogId,
        url,
        undefined,
        false,
        authUserByLoginOrEmailResponse.AT
      );

    expect(getCommentListByPostIdResponse_01.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse_01.items.length).toBe(5);
    expect(getCommentListByPostIdResponse_01.totalCount).toBe(8);
    expect(getCommentListByPostIdResponse_01.items[0].content).toBe(validCommentContents.content_01);
    expect(getCommentListByPostIdResponse_01.items[1].content).toBe(validCommentContents.content_02);
    expect(getCommentListByPostIdResponse_01.items[2].content).toBe(validCommentContents.content_03);
    expect(getCommentListByPostIdResponse_01.items[3].content).toBe(validCommentContents.content_04);
    expect(getCommentListByPostIdResponse_01.items[4].content).toBe(validCommentContents.content_05);
    expect(getCommentListByPostIdResponse_01.items[0].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_01.items[1].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_01.items[2].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_01.items[3].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_01.items[4].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_02.items).toBeInstanceOf(Array);
    expect(getCommentListByPostIdResponse_02.items.length).toBe(5);
    expect(getCommentListByPostIdResponse_02.totalCount).toBe(8);
    expect(getCommentListByPostIdResponse_02.items[0].content).toBe(validCommentContents.content_01);
    expect(getCommentListByPostIdResponse_02.items[1].content).toBe(validCommentContents.content_02);
    expect(getCommentListByPostIdResponse_02.items[2].content).toBe(validCommentContents.content_03);
    expect(getCommentListByPostIdResponse_02.items[3].content).toBe(validCommentContents.content_04);
    expect(getCommentListByPostIdResponse_02.items[4].content).toBe(validCommentContents.content_05);
    expect(getCommentListByPostIdResponse_02.items[0].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
    expect(getCommentListByPostIdResponse_02.items[1].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.Dislike);
    expect(getCommentListByPostIdResponse_02.items[2].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_02.items[3].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getCommentListByPostIdResponse_02.items[4].likesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
  });

  it('✅ 007 should update post like status by a correct ID when a valid access token passed; PostsController 005. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createdPostForBlogId: string = createdPostForBlog.id;
    const createUserInputDTO_01: CreateUserInputDTO = getCreateUserInputDTO();

    const createUserInputDTO_02: CreateUserInputDTO = {
      login: validUserLogins.login_01,
      password: validUserPasswords.password_01,
      email: validUserEmails.email_01,
    };

    const createUserInputDTO_03: CreateUserInputDTO = {
      login: validUserLogins.login_03,
      password: validUserPasswords.password_01,
      email: validUserEmails.email_03,
    };

    const createdConfirmedUser_01: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO_01);
    const createdConfirmedUser_02: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO_02);
    const createdConfirmedUser_03: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO_03);

    const authUserByLoginOrEmailResponse_01: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_01.login,
      password: createUserInputDTO_01.password,
    });

    const authUserByLoginOrEmailResponse_02: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_02.login,
      password: createUserInputDTO_02.password,
    });

    const authUserByLoginOrEmailResponse_03: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_03.login,
      password: createUserInputDTO_03.password,
    });

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getPostByIdResponse_01: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getPostByIdResponse_02: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getPostByIdResponse_03: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getPostByIdResponse_04: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getPostByIdResponse_05: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getPostByIdResponse_06: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_02.AT
    );

    const getPostByIdResponse_07: PostOutputDTO = await getPostById(testApp.app, createdPostForBlogId);

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_02.AT
    );

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_03.AT
    );

    const getPostByIdResponse_08: PostOutputDTO = await getPostById(
      testApp.app,
      createdPostForBlogId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    expect(getPostByIdResponse_01.extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
    expect(getPostByIdResponse_01.extendedLikesInfo.likesCount).toBe(1);
    expect(getPostByIdResponse_01.extendedLikesInfo.dislikesCount).toBe(0);
    expect(getPostByIdResponse_02.extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostByIdResponse_02.extendedLikesInfo.likesCount).toBe(0);
    expect(getPostByIdResponse_02.extendedLikesInfo.dislikesCount).toBe(0);
    expect(getPostByIdResponse_03.extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Dislike);
    expect(getPostByIdResponse_03.extendedLikesInfo.likesCount).toBe(0);
    expect(getPostByIdResponse_03.extendedLikesInfo.dislikesCount).toBe(1);
    expect(getPostByIdResponse_04.extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostByIdResponse_04.extendedLikesInfo.likesCount).toBe(0);
    expect(getPostByIdResponse_04.extendedLikesInfo.dislikesCount).toBe(0);
    expect(getPostByIdResponse_05.extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.Like);
    expect(getPostByIdResponse_05.extendedLikesInfo.likesCount).toBe(1);
    expect(getPostByIdResponse_05.extendedLikesInfo.dislikesCount).toBe(0);
    expect(getPostByIdResponse_06.extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostByIdResponse_06.extendedLikesInfo.likesCount).toBe(1);
    expect(getPostByIdResponse_06.extendedLikesInfo.dislikesCount).toBe(0);
    expect(getPostByIdResponse_07.extendedLikesInfo.myStatus).toBe(PostLikeStatusInputDTO.None);
    expect(getPostByIdResponse_07.extendedLikesInfo.likesCount).toBe(1);
    expect(getPostByIdResponse_07.extendedLikesInfo.dislikesCount).toBe(0);
    expect(getPostByIdResponse_08.extendedLikesInfo.newestLikes).toBeInstanceOf(Array);
    expect(getPostByIdResponse_08.extendedLikesInfo.newestLikes.length).toBe(3);
    expect(getPostByIdResponse_08.extendedLikesInfo.newestLikes[0].userId).toBe(createdConfirmedUser_03.id);
    expect(getPostByIdResponse_08.extendedLikesInfo.newestLikes[1].userId).toBe(createdConfirmedUser_02.id);
    expect(getPostByIdResponse_08.extendedLikesInfo.newestLikes[2].userId).toBe(createdConfirmedUser_01.id);
  });
});
