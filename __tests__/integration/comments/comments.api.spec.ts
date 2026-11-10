import { NestExpressApplication } from '@nestjs/platform-express';
import { UpdateCommentByIdInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-by-id.input-dto';
import { CommentLikeStatusInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { CommentOutputDTO } from '../../../src/modules/blog/api/comments/output-dto/comment.output-dto';
import { PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { UserOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { validUserEmails, validUserLogins, validUserPasswords } from '../../test-data/users.test-data';
import { authUserByLoginOrEmail } from '../../utils/auth/auth-user-by-login-or-email.test-util';
import { createBlogSA } from '../../utils/blogs/create-blog-sa.test-util';
import { createCommentForPost } from '../../utils/comments/create-comment-for-post.test-util';
import { getCommentById } from '../../utils/comments/get-comment-by-id.test-util';
import { getUpdateCommentByIdInputDTO } from '../../utils/comments/input-dto-utils/get-update-comment-by-id-input-dto.test-util';
import { updateCommentById } from '../../utils/comments/update-comment-by-id.test-util';
import { updateCommentLikeStatusById } from '../../utils/comments/update-comment-like-status-by-id.test-util';
import { doBeforeTests } from '../../utils/common/do-before-tests.test-util';
import { createPostForBlogSA } from '../../utils/post/create-post-for-blog-sa.test-util';
import { createConfirmedUserSA } from '../../utils/users/create-confirmed-user-sa.test-util';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';

describe('Comments API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should return a comment by a correct ID; CommentsController 001. GET', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    const createdComment: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlog.id,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(testApp.app, createdComment.id);
    expect(getCommentByIdResponse).toEqual(createdComment);
    expect(getCommentByIdResponse.commentatorInfo.userId).toBe(createdUser.id);
    expect(getCommentByIdResponse.commentatorInfo.userLogin).toBe(createdUser.login);
  });

  it('✅ 002 should update a comment by a correct ID when a valid access token passed; CommentsController 002. PUT', async (): Promise<void> => {
    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await createConfirmedUserSA(testApp.app, createUserInputDTO);

    const authUserByLoginOrEmailResponse: { AT: string } = await authUserByLoginOrEmail(
      testApp.app,
      createUserInputDTO
    );

    const createdComment: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlog.id,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const createdCommentId: string = createdComment.id;

    const updateCommentByIdInputDTO: UpdateCommentByIdInputDTO = getUpdateCommentByIdInputDTO();

    await updateCommentById(
      testApp.app,
      createdCommentId,
      updateCommentByIdInputDTO,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(testApp.app, createdComment.id);

    expect(getCommentByIdResponse).toEqual({
      id: createdCommentId,
      content: updateCommentByIdInputDTO.content,
      commentatorInfo: createdComment.commentatorInfo,
      createdAt: createdComment.createdAt,
      likesInfo: createdComment.likesInfo,
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

    const authUserByLoginOrEmailResponse_01: { AT: string } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_01.login,
      password: createUserInputDTO_01.password,
    });

    const authUserByLoginOrEmailResponse_02: { AT: string } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_02.login,
      password: createUserInputDTO_02.password,
    });

    const createdComment: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlog.id,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const createdCommentId: string = createdComment.id;

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_01: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_02: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_03: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_04: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_05: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_06: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_02.AT
    );

    const getCommentByIdResponse_07: CommentOutputDTO = await getCommentById(testApp.app, createdCommentId);
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
    const createUserInputDTO_01: CreateUserInputDTO = getCreateUserInputDTO();

    const createUserInputDTO_02: CreateUserInputDTO = {
      login: validUserLogins.login_01,
      password: validUserPasswords.password_01,
      email: validUserEmails.email_01,
    };

    await createConfirmedUserSA(testApp.app, createUserInputDTO_01);
    await createConfirmedUserSA(testApp.app, createUserInputDTO_02);

    const authUserByLoginOrEmailResponse_01: { AT: string } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_01.login,
      password: createUserInputDTO_01.password,
    });

    const authUserByLoginOrEmailResponse_02: { AT: string } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_02.login,
      password: createUserInputDTO_02.password,
    });

    const createdComment: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlog.id,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const createdCommentId: string = createdComment.id;

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_01: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_02: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.Dislike },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_03: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.None },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_04: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentId,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_05: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const getCommentByIdResponse_06: CommentOutputDTO = await getCommentById(
      testApp.app,
      createdCommentId,
      undefined,
      false,
      authUserByLoginOrEmailResponse_02.AT
    );

    const getCommentByIdResponse_07: CommentOutputDTO = await getCommentById(testApp.app, createdCommentId);
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
});
