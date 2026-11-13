import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { UpdateCommentByIdInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-by-id.input-dto';
import { CommentLikeStatusInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { CommentOutputDTO } from '../../../src/modules/blog/api/comments/output-dto/comment.output-dto';
import { PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { UserOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { validUserEmails, validUserLogins, validUserPasswords } from '../../test-data/users.test-data';
import { authUserByLoginOrEmail } from '../../test-utils/auth/auth-user-by-login-or-email.test-util';
import { createBlogSA } from '../../test-utils/blogs/create-blog-sa.test-util';
import { createCommentForPost } from '../../test-utils/comments/create-comment-for-post.test-util';
import { deleteCommentById } from '../../test-utils/comments/delete-comment-by-id.test-util';
import { getCommentById } from '../../test-utils/comments/get-comment-by-id.test-util';
import { hasAnyCommentLikeDataByCommentId } from '../../test-utils/comments/has-any-comment-like-data-by-comment-id.test-util';
import { getUpdateCommentByIdInputDTO } from '../../test-utils/comments/input-dto-utils/get-update-comment-by-id-input-dto.test-util';
import { updateCommentById } from '../../test-utils/comments/update-comment-by-id.test-util';
import { updateCommentLikeStatusById } from '../../test-utils/comments/update-comment-like-status-by-id.test-util';
import { doBeforeTests } from '../../test-utils/common/do-before-tests.test-util';
import { createPostForBlogSA } from '../../test-utils/post/create-post-for-blog-sa.test-util';
import { createConfirmedUserSA } from '../../test-utils/users/create-confirmed-user-sa.test-util';
import { getCreateUserInputDTO } from '../../test-utils/users/input-dto-utils/get-create-user-input-dto.test-util';

describe('Comments API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should return a comment by a correct ID when a valid access token passed; CommentsController 001. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    const createdConfirmedUser: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO);
    const createdConfirmedUserId: string = createdConfirmedUser.id;
    const createdConfirmedUserLogin: string = createdConfirmedUser.login;

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

    const createdCommentForPostId: string = createdCommentForPost.id;
    const getCommentByIdResponse_01: CommentOutputDTO = await getCommentById(testApp.app, createdCommentForPostId);

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getCommentByIdResponse_02: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentForPostId,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    expect(getCommentByIdResponse_01).toEqual(createdCommentForPost);
    expect(getCommentByIdResponse_01.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.None);
    expect(getCommentByIdResponse_01.commentatorInfo.userId).toBe(createdConfirmedUserId);
    expect(getCommentByIdResponse_01.commentatorInfo.userLogin).toBe(createdConfirmedUserLogin);
    expect(getCommentByIdResponse_02).not.toEqual(createdCommentForPost);
    expect(getCommentByIdResponse_02.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.Like);
    expect(getCommentByIdResponse_02.commentatorInfo.userId).toBe(createdConfirmedUserId);
    expect(getCommentByIdResponse_02.commentatorInfo.userLogin).toBe(createdConfirmedUserLogin);
  });

  it('✅ 002 should update a comment by a correct ID when a valid access token passed; CommentsController 002. PUT', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

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

    const createdCommentForPostId: string = createdCommentForPost.id;

    const updateCommentByIdInputDTO: UpdateCommentByIdInputDTO = getUpdateCommentByIdInputDTO();

    await updateCommentById(
      testApp.app,
      createdCommentForPostId,
      updateCommentByIdInputDTO,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(testApp.app, createdCommentForPostId);

    expect(getCommentByIdResponse).toEqual({
      id: createdCommentForPostId,
      content: updateCommentByIdInputDTO.content,
      commentatorInfo: createdCommentForPost.commentatorInfo,
      createdAt: createdCommentForPost.createdAt,
      likesInfo: createdCommentForPost.likesInfo,
    });
  });

  it('✅ 003 should update comment like status by a correct ID when a valid access token passed; CommentsController 003. PUT', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createUserInputDTO_01: CreateUserInputDTO = getCreateUserInputDTO();

    const createUserInputDTO_02: CreateUserInputDTO = {
      login: validUserLogins.login_01,
      password: validUserPasswords.password_01,
      email: validUserEmails.email_01,
    };

    await createConfirmedUserSA(testApp.app, createUserInputDTO_01);
    await createConfirmedUserSA(testApp.app, createUserInputDTO_02);

    const authUserByLoginOrEmailResponse_01: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_01.login,
      password: createUserInputDTO_01.password,
    });

    const authUserByLoginOrEmailResponse_02: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_02.login,
      password: createUserInputDTO_02.password,
    });

    const createdCommentForPost: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlog.id,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const createdCommentForPostId: string = createdCommentForPost.id;

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_01: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentForPostId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_02: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentForPostId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_03: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentForPostId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_04: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentForPostId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_05: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentForPostId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_06: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentForPostId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_02.AT
    );

    const getCommentByIdResponse_07: CommentOutputDTO = await getCommentById(testApp.app, createdCommentForPostId);
    expect(getCommentByIdResponse_01.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.Like);
    expect(getCommentByIdResponse_01.likesInfo.likesCount).toBe(1);
    expect(getCommentByIdResponse_01.likesInfo.dislikesCount).toBe(0);
    expect(getCommentByIdResponse_02.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.None);
    expect(getCommentByIdResponse_02.likesInfo.likesCount).toBe(0);
    expect(getCommentByIdResponse_02.likesInfo.dislikesCount).toBe(0);
    expect(getCommentByIdResponse_03.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.Dislike);
    expect(getCommentByIdResponse_03.likesInfo.likesCount).toBe(0);
    expect(getCommentByIdResponse_03.likesInfo.dislikesCount).toBe(1);
    expect(getCommentByIdResponse_04.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.None);
    expect(getCommentByIdResponse_04.likesInfo.likesCount).toBe(0);
    expect(getCommentByIdResponse_04.likesInfo.dislikesCount).toBe(0);
    expect(getCommentByIdResponse_05.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.Like);
    expect(getCommentByIdResponse_05.likesInfo.likesCount).toBe(1);
    expect(getCommentByIdResponse_05.likesInfo.dislikesCount).toBe(0);
    expect(getCommentByIdResponse_06.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.None);
    expect(getCommentByIdResponse_06.likesInfo.likesCount).toBe(1);
    expect(getCommentByIdResponse_06.likesInfo.dislikesCount).toBe(0);
    expect(getCommentByIdResponse_07.likesInfo.myStatus).toBe(CommentLikeStatusInputDTO.None);
    expect(getCommentByIdResponse_07.likesInfo.likesCount).toBe(1);
    expect(getCommentByIdResponse_07.likesInfo.dislikesCount).toBe(0);
  });

  it('✅ 004 should delete a comment and its likes by a correct ID when a valid access token passed; CommentsController 004. DELETE', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO.login,
      password: createUserInputDTO.password,
    });

    const createdCommentForPost: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlog.id,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const createdCommentForPostId: string = createdCommentForPost.id;

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    await deleteCommentById(testApp.app, createdCommentForPostId, undefined, false, authUserByLoginOrEmailResponse.AT);
    await getCommentById(testApp.app, createdCommentForPostId, HttpStatus.NOT_FOUND);
    expect(await hasAnyCommentLikeDataByCommentId(testApp.app, createdCommentForPostId)).toBe(false);
  });
});
