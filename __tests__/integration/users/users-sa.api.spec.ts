import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CommentLikeStatusInputDTO } from '../../../src/modules/blog/api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { PostLikeStatusInputDTO } from '../../../src/modules/blog/api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogOutputDTO } from '../../../src/modules/blog/api/blogs/output-dto/blog.output-dto';
import { CommentOutputDTO } from '../../../src/modules/blog/api/comments/output-dto/comment.output-dto';
import { PostOutputDTO } from '../../../src/modules/blog/api/posts/output-dto/post.output-dto';
import { UserListOutputDTO, UserOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import {
  validUserData,
  validUserEmails,
  validUserLogins,
  validUserPasswords,
  validUsersPaginationSettings,
} from '../../test-data/users.test-data';
import { authUserByLoginOrEmail } from '../../utils/auth/auth-user-by-login-or-email.test-util';
import { hasAnySessionByUserId } from '../../utils/auth/has-any-session-by-user-id.test-util';
import { hasEmailConfirmationsByUserId } from '../../utils/auth/has-email-confirmations-by-user-id.test-util';
import { hasPasswordRecoveryCodesDataByUserId } from '../../utils/auth/has-password-recovery-codes-data-by-user-id.test-util';
import { createBlogSA } from '../../utils/blogs/create-blog-sa.test-util';
import { createCommentForPost } from '../../utils/comments/create-comment-for-post.test-util';
import { getCommentById } from '../../utils/comments/get-comment-by-id.test-util';
import { hasAnyCommentLikeDataByCommentId } from '../../utils/comments/has-any-comment-like-data-by-comment-id.test-util';
import { updateCommentLikeStatusById } from '../../utils/comments/update-comment-like-status-by-id.test-util';
import { doBeforeTests } from '../../utils/common/do-before-tests.test-util';
import { createPostForBlogSA } from '../../utils/post/create-post-for-blog-sa.test-util';
import { hasPostLikesDataByPostId } from '../../utils/post/has-post-likes-data-by-post-id.test-util';
import { updatePostLikeStatusById } from '../../utils/post/update-post-like-status-by-id.test-util';
import { hasAnySecurityDeviceByUserId } from '../../utils/security-devices/has-any-security-device-by-user-id.test-util';
import { createConfirmedUserSA } from '../../utils/users/create-confirmed-user-sa.test-util';
import { deleteUserByIdSA } from '../../utils/users/delete-user-by-id-sa.test-util';
import { getUserListSA } from '../../utils/users/get-user-list-sa.test-util';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { isUserConfirmedByUserIdTestUtil } from '../../utils/users/is-user-confirmed-by-user-id.test-util';

describe('Users SA API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should create a confirmed user when a valid basic auth token passed; UsersSaController 001. POST', async (): Promise<void> => {
    const createdConfirmedUser: UserOutputDTO = await createConfirmedUserSA(testApp.app);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    expect(getUserListResponse.items[0]).toEqual(createdConfirmedUser);
    expect(await isUserConfirmedByUserIdTestUtil(testApp.app, createdConfirmedUser.id)).toBe(true);
  });

  it('✅ 002 should return a list of users when a valid basic auth token passed; UsersSaController 002. GET', async (): Promise<void> => {
    await Promise.all([createConfirmedUserSA(testApp.app, validUserData.data_01), createConfirmedUserSA(testApp.app)]);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(2);
    expect(getUserListResponse.totalCount).toBe(2);
  });

  it('✅ 003 should return a list of users when valid pagination settings and a valid basic auth token passed; UsersSaController 002. GET', async (): Promise<void> => {
    await Promise.all([
      createConfirmedUserSA(testApp.app, validUserData.data_01),
      createConfirmedUserSA(testApp.app, validUserData.data_02),
      createConfirmedUserSA(testApp.app, validUserData.data_03),
      createConfirmedUserSA(testApp.app, validUserData.data_04),
      createConfirmedUserSA(testApp.app, validUserData.data_05),
      createConfirmedUserSA(testApp.app, validUserData.data_06),
    ]);

    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.USERS_SA_PREFIX}/${SETTINGS.USERS_SA_GET_USER_LIST_PATH}?pageSize=${validUsersPaginationSettings.pageSize}&pageNumber=${validUsersPaginationSettings.pageNumber}&searchLoginTerm=${validUsersPaginationSettings.searchLoginTerm}&searchEmailTerm=${validUsersPaginationSettings.searchEmailTerm}&sortDirection=${validUsersPaginationSettings.sortDirection}&sortBy=${validUsersPaginationSettings.sortBy}`;
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app, url);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(3);
    expect(getUserListResponse.totalCount).toBe(3);
    expect(getUserListResponse.items[0].login).toBe(validUserData.data_06.login);
    expect(getUserListResponse.items[1].login).toBe(validUserData.data_04.login);
    expect(getUserListResponse.items[2].login).toBe(validUserData.data_03.login);
  });

  it('✅ 004 should delete a user by a correct ID when a valid basic auth token passed; UsersSaController 003. DELETE', async (): Promise<void> => {
    const createUserInputDTO_01: CreateUserInputDTO = getCreateUserInputDTO();

    const createUserInputDTO_02: CreateUserInputDTO = {
      login: validUserLogins.login_01,
      password: validUserPasswords.password_01,
      email: validUserEmails.email_01,
    };

    const createdConfirmedUser_01: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO_01);
    const createdConfirmedUserId_01: string = createdConfirmedUser_01.id;
    const createdConfirmedUser_02: UserOutputDTO = await createConfirmedUserSA(testApp.app, createUserInputDTO_02);

    const authUserByLoginOrEmailResponse_01: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_01.login,
      password: createUserInputDTO_01.password,
    });

    const authUserByLoginOrEmailResponse_02: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO_02.login,
      password: createUserInputDTO_02.password,
    });

    const createdBlog: BlogOutputDTO = await createBlogSA(testApp.app);
    const createdPostForBlog: PostOutputDTO = await createPostForBlogSA(testApp.app, createdBlog.id);
    const createdPostForBlogId: string = createdPostForBlog.id;

    const createdCommentForPost_01: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    const createdCommentForPostId_01: string = createdCommentForPost_01.id;

    const createdCommentForPost_02: CommentOutputDTO = await createCommentForPost(
      testApp.app,
      createdPostForBlogId,
      undefined,
      undefined,
      false,
      authUserByLoginOrEmailResponse_02.AT
    );

    const createdCommentForPostId_02: string = createdCommentForPost_02.id;

    await updatePostLikeStatusById(
      testApp.app,
      createdPostForBlogId,
      { likeStatus: PostLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId_01,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_02.AT
    );

    await updateCommentLikeStatusById(
      testApp.app,
      createdCommentForPostId_02,
      { likeStatus: CommentLikeStatusInputDTO.Like },
      undefined,
      false,
      authUserByLoginOrEmailResponse_01.AT
    );

    await deleteUserByIdSA(testApp.app, createdConfirmedUserId_01);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(1);
    expect(getUserListResponse.items[0]).toEqual(createdConfirmedUser_02);
    expect(await hasPostLikesDataByPostId(testApp.app, createdPostForBlogId)).toBe(false);
    await getCommentById(testApp.app, createdCommentForPostId_01, HttpStatus.NOT_FOUND);
    await getCommentById(testApp.app, createdCommentForPostId_02);
    expect(await hasAnyCommentLikeDataByCommentId(testApp.app, createdCommentForPostId_01)).toBe(false);
    expect(await hasAnyCommentLikeDataByCommentId(testApp.app, createdCommentForPostId_02)).toBe(false);
    expect(await hasAnySecurityDeviceByUserId(testApp.app, createdConfirmedUserId_01)).toBe(false);
    expect(await hasAnySessionByUserId(testApp.app, createdConfirmedUserId_01)).toBe(false);
    expect(await hasPasswordRecoveryCodesDataByUserId(testApp.app, createdConfirmedUserId_01)).toBe(false);
    expect(await hasEmailConfirmationsByUserId(testApp.app, createdConfirmedUserId_01)).toBe(false);
  });
});
