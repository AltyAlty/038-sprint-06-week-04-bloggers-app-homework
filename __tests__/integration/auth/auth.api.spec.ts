import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setTimeout } from 'timers/promises';
import { EmailConfirmationList } from '../../../src/modules/user/domain/auth/email-confirmation.entity';
import { PasswordRecoveryCodeDataList } from '../../../src/modules/user/domain/auth/password-recovery-code-data.entity';
import { Session, SessionList } from '../../../src/modules/user/domain/auth/session.entity';
import {
  SecurityDevice,
  SecurityDeviceList,
} from '../../../src/modules/user/domain/security-devices/security-device.entity';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { AuthUserDataOutputDTO } from '../../../src/modules/user/api/auth/output-dto/auth-user-data.output-dto';
import { UserListOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { validUserPasswords } from '../../test-data/users.test-data';
import { emailManagerMock } from '../../test-doubles/mocks.test-util';
import { authUserByLoginOrEmail } from '../../test-utils/auth/auth-user-by-login-or-email.test-util';
import { confirmUserByCode } from '../../test-utils/auth/confirm-user-by-code.test-util';
import { createNewAccessAndRefreshTokens } from '../../test-utils/auth/create-new-access-and-refresh-tokens.test-util';
import { decodeAccessToken } from '../../test-utils/auth/decode-access-token.test-util';
import { decodeRefreshToken } from '../../test-utils/auth/decode-refresh-token.test-util';
import { getAuthUserDataByAccessToken } from '../../test-utils/auth/get-auth-user-data-by-access-token.test-util';
import { getEmailConfirmationListByUserId } from '../../test-utils/auth/get-email-confirmation-list-by-user-id.test-util';
import { getPasswordRecoveryCodeDataListByUserIdTestUtil } from '../../test-utils/auth/get-password-recovery-code-data-list-by-user-id.test-util';
import { getSessionListByUserId } from '../../test-utils/auth/get-session-list-by-user-id.test-util';
import { getUserPasswordHashById } from '../../test-utils/auth/get-user-password-hash-by-id.test-util';
import { hasEmailConfirmationsByUserId } from '../../test-utils/auth/has-email-confirmations-by-user-id.test-util';
import { hasPasswordRecoveryCodesDataByUserId } from '../../test-utils/auth/has-password-recovery-codes-data-by-user-id.test-util';
import { registerUser } from '../../test-utils/auth/register-user.test-util';
import { resendConfirmationEmail } from '../../test-utils/auth/resend-confirmation-email.test-util';
import { revokeSession } from '../../test-utils/auth/revoke-session.test-util';
import { sendPasswordRecoveryCode } from '../../test-utils/auth/send-password-recovery-code.test-util';
import { setNewPasswordByPasswordRecoveryCode } from '../../test-utils/auth/set-new-password-by-password-recovery-code.test-util';
import { doBeforeTests } from '../../test-utils/common/do-before-tests.test-util';
import { getSecurityDeviceListByUserId } from '../../test-utils/security-devices/get-security-device-list-by-user-id.test-util';
import { getUserListSA } from '../../test-utils/users/get-user-list-sa.test-util';
import { getCreateUserInputDTO } from '../../test-utils/users/input-dto-utils/get-create-user-input-dto.test-util';
import { isUserConfirmedByUserIdTestUtil } from '../../test-utils/users/is-user-confirmed-by-user-id.test-util';

describe('Auth API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should register a user when a valid body passed; AuthController 001. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    expect(await isUserConfirmedByUserIdTestUtil(testApp.app, registeredUserId)).toBe(false);
    expect(emailConfirmationList).toBeInstanceOf(Array);
    expect(emailConfirmationList.length).toBe(1);
    expect(emailManagerMock.sendCompleteRegistrationEmail).toHaveBeenCalledTimes(1);

    expect(emailManagerMock.sendCompleteRegistrationEmail).toHaveBeenCalledWith(
      createUserInputDTO.email,
      emailConfirmationList[0].confirmationCode
    );
  });

  it('✅ 002 should resend a registration confirmation email when a correct email passed; AuthController 002. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList_01: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await resendConfirmationEmail(testApp.app, { email: createUserInputDTO.email });

    const emailConfirmationList_02: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    expect(await isUserConfirmedByUserIdTestUtil(testApp.app, registeredUserId)).toBe(false);
    expect(emailConfirmationList_02).toBeInstanceOf(Array);
    expect(emailConfirmationList_02.length).toBe(1);
    expect(emailConfirmationList_01[0].confirmationCode).not.toBe(emailConfirmationList_02[0].confirmationCode);
    expect(emailManagerMock.sendCompleteRegistrationEmail).toHaveBeenCalledTimes(2);

    expect(emailManagerMock.sendCompleteRegistrationEmail).toHaveBeenNthCalledWith(
      1,
      createUserInputDTO.email,
      emailConfirmationList_01[0].confirmationCode
    );

    expect(emailManagerMock.sendCompleteRegistrationEmail).toHaveBeenNthCalledWith(
      2,
      createUserInputDTO.email,
      emailConfirmationList_02[0].confirmationCode
    );
  });

  it('✅ 003 should confirm a user registration when a correct confirmation code passed; AuthController 003. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });
    expect(await isUserConfirmedByUserIdTestUtil(testApp.app, registeredUserId)).toBe(true);
    expect(await hasEmailConfirmationsByUserId(testApp.app, registeredUserId)).toBe(false);
  });

  it('✅ 004 should confirm a user registration after resending a registration confirmation email when a correct confirmation code passed; AuthController 003. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    await resendConfirmationEmail(testApp.app, { email: createUserInputDTO.email });
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });
    expect(await isUserConfirmedByUserIdTestUtil(testApp.app, registeredUserId)).toBe(true);
    expect(await hasEmailConfirmationsByUserId(testApp.app, registeredUserId)).toBe(false);
  });

  it('✅ 005 should send a password recovery email when a correct email passed; AuthController 004. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });
    const passwordHash_01: string | null = await getUserPasswordHashById(testApp.app, registeredUserId);
    await sendPasswordRecoveryCode(testApp.app, { email: createUserInputDTO.email });
    const passwordHash_02: string | null = await getUserPasswordHashById(testApp.app, registeredUserId);

    const passwordRecoveryCodeDataList: PasswordRecoveryCodeDataList =
      await getPasswordRecoveryCodeDataListByUserIdTestUtil(testApp.app, registeredUserId);

    expect(passwordHash_01).toBe(passwordHash_02);
    expect(passwordRecoveryCodeDataList).toBeInstanceOf(Array);
    expect(passwordRecoveryCodeDataList.length).toBe(1);
    expect(emailManagerMock.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);

    expect(emailManagerMock.sendPasswordRecoveryEmail).toHaveBeenCalledWith(
      createUserInputDTO.email,
      passwordRecoveryCodeDataList[0].passwordRecoveryCode
    );
  });

  it('✅ 006 should set a new password when a valid body passed; AuthController 005. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });
    const passwordHash_01: string | null = await getUserPasswordHashById(testApp.app, registeredUserId);
    await sendPasswordRecoveryCode(testApp.app, { email: createUserInputDTO.email });

    const passwordRecoveryCodeDataList: PasswordRecoveryCodeDataList =
      await getPasswordRecoveryCodeDataListByUserIdTestUtil(testApp.app, registeredUserId);

    await setNewPasswordByPasswordRecoveryCode(testApp.app, {
      password: validUserPasswords.password_01,
      recoveryCode: passwordRecoveryCodeDataList[0].passwordRecoveryCode,
    });

    const passwordHash_02: string | null = await getUserPasswordHashById(testApp.app, registeredUserId);
    expect(passwordHash_01).not.toBe(passwordHash_02);
    expect(await hasPasswordRecoveryCodesDataByUserId(testApp.app, registeredUserId)).toBe(false);
  });

  it('✅ 007 should authenticate a user when correct login and password passed; AuthController 006. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse: {
      AT: string | undefined;
      RT: string | undefined;
      hasHttpOnly: boolean | undefined;
      hasSecure: boolean | undefined;
    } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO.login,
      password: createUserInputDTO.password,
    });

    const accessToken: string | undefined = authUserByLoginOrEmailResponse.AT;
    const refreshToken: string | undefined = authUserByLoginOrEmailResponse.RT;
    const hasHttpOnly: boolean | undefined = authUserByLoginOrEmailResponse.hasHttpOnly;
    const hasSecure: boolean | undefined = authUserByLoginOrEmailResponse.hasSecure;

    const accessTokenPayload: { userId: string; iat: Date; exp: Date } | null = decodeAccessToken(
      testApp.app,
      accessToken!
    );

    const accessTokenUserId: string | undefined = accessTokenPayload?.userId;
    const accessTokenIat: Date | undefined = accessTokenPayload?.iat;

    const refreshTokenPayload: { userId: string; deviceId: string; iat: Date; exp: Date } | null = decodeRefreshToken(
      testApp.app,
      refreshToken!
    );

    const refreshTokenUserId: string | undefined = refreshTokenPayload?.userId;
    const refreshTokenDeviceId: string | undefined = refreshTokenPayload?.deviceId;
    const refreshTokenIat: Date | undefined = refreshTokenPayload?.iat;
    const refreshTokenExp: Date | undefined = refreshTokenPayload?.exp;
    const sessionList: SessionList = await getSessionListByUserId(testApp.app, registeredUserId);
    const session: Session = sessionList[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;
    const securityDeviceList: SecurityDeviceList = await getSecurityDeviceListByUserId(testApp.app, registeredUserId);
    const securityDevice: SecurityDevice = securityDeviceList[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceUserId: string = securityDevice.userId;
    const securityDeviceLastActiveDate: Date = securityDevice.lastActiveDate;
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
    expect(accessToken).not.toBe(refreshToken);
    expect(hasHttpOnly).toBe(true);
    expect(hasSecure).toBe(true);
    expect(accessTokenUserId).toBe(registeredUserId);
    expect(accessTokenUserId).toBe(refreshTokenUserId);
    expect(accessTokenUserId).toBe(sessionUserId);
    expect(accessTokenUserId).toBe(securityDeviceUserId);
    expect(accessTokenIat).toEqual(refreshTokenIat);
    expect(refreshTokenIat).toEqual(sessionIat);
    expect(refreshTokenIat).toEqual(securityDeviceLastActiveDate);
    expect(refreshTokenExp).toEqual(sessionExp);
    expect(refreshTokenDeviceId).toBe(sessionDeviceId);
    expect(refreshTokenDeviceId).toBe(securityDeviceId);
    expect(sessionList).toBeInstanceOf(Array);
    expect(sessionList.length).toBe(1);
    expect(securityDeviceList).toBeInstanceOf(Array);
    expect(securityDeviceList.length).toBe(1);
  });

  it('✅ 008 should authenticate a user when correct email and password passed; AuthController 006. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse: {
      AT: string | undefined;
      RT: string | undefined;
      hasHttpOnly: boolean | undefined;
      hasSecure: boolean | undefined;
    } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO.email,
      password: createUserInputDTO.password,
    });

    const accessToken: string | undefined = authUserByLoginOrEmailResponse.AT;
    const refreshToken: string | undefined = authUserByLoginOrEmailResponse.RT;
    const hasHttpOnly: boolean | undefined = authUserByLoginOrEmailResponse.hasHttpOnly;
    const hasSecure: boolean | undefined = authUserByLoginOrEmailResponse.hasSecure;

    const accessTokenPayload: { userId: string; iat: Date; exp: Date } | null = decodeAccessToken(
      testApp.app,
      accessToken!
    );

    const accessTokenUserId: string | undefined = accessTokenPayload?.userId;
    const accessTokenIat: Date | undefined = accessTokenPayload?.iat;

    const refreshTokenPayload: { userId: string; deviceId: string; iat: Date; exp: Date } | null = decodeRefreshToken(
      testApp.app,
      refreshToken!
    );

    const refreshTokenUserId: string | undefined = refreshTokenPayload?.userId;
    const refreshTokenDeviceId: string | undefined = refreshTokenPayload?.deviceId;
    const refreshTokenIat: Date | undefined = refreshTokenPayload?.iat;
    const refreshTokenExp: Date | undefined = refreshTokenPayload?.exp;
    const sessionList: SessionList = await getSessionListByUserId(testApp.app, registeredUserId);
    const session: Session = sessionList[0];
    const sessionUserId: string = session.userId;
    const sessionDeviceId: string = session.deviceId;
    const sessionIat: Date = session.iat;
    const sessionExp: Date = session.exp;
    const securityDeviceList: SecurityDeviceList = await getSecurityDeviceListByUserId(testApp.app, registeredUserId);
    const securityDevice: SecurityDevice = securityDeviceList[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceUserId: string = securityDevice.userId;
    const securityDeviceLastActiveDate: Date = securityDevice.lastActiveDate;
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
    expect(accessToken).not.toBe(refreshToken);
    expect(hasHttpOnly).toBe(true);
    expect(hasSecure).toBe(true);
    expect(accessTokenUserId).toBe(registeredUserId);
    expect(accessTokenUserId).toBe(refreshTokenUserId);
    expect(accessTokenUserId).toBe(sessionUserId);
    expect(accessTokenUserId).toBe(securityDeviceUserId);
    expect(accessTokenIat).toEqual(refreshTokenIat);
    expect(refreshTokenIat).toEqual(sessionIat);
    expect(refreshTokenIat).toEqual(securityDeviceLastActiveDate);
    expect(refreshTokenExp).toEqual(sessionExp);
    expect(refreshTokenDeviceId).toBe(sessionDeviceId);
    expect(refreshTokenDeviceId).toBe(securityDeviceId);
    expect(sessionList).toBeInstanceOf(Array);
    expect(sessionList.length).toBe(1);
    expect(securityDeviceList).toBeInstanceOf(Array);
    expect(securityDeviceList.length).toBe(1);
  });

  it('✅ 009 should create new access and refresh tokens when a correct refresh token passed; AuthController 007. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse: {
      AT: string | undefined;
      RT: string | undefined;
      hasHttpOnly: boolean | undefined;
      hasSecure: boolean | undefined;
    } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO.login,
      password: createUserInputDTO.password,
    });

    const oldAccessToken: string | undefined = authUserByLoginOrEmailResponse.AT;
    const oldRefreshToken: string | undefined = authUserByLoginOrEmailResponse.RT;

    const oldAccessTokenPayload: { userId: string; iat: Date; exp: Date } | null = decodeAccessToken(
      testApp.app,
      oldAccessToken!
    );

    const oldAccessTokenIat: Date | undefined = oldAccessTokenPayload?.iat;
    const oldAccessTokenExp: Date | undefined = oldAccessTokenPayload?.exp;

    const oldRefreshTokenPayload: { userId: string; deviceId: string; iat: Date; exp: Date } | null =
      decodeRefreshToken(testApp.app, oldRefreshToken!);

    const oldRefreshTokenDeviceId: string | undefined = oldRefreshTokenPayload?.deviceId;
    const oldRefreshTokenExp: Date | undefined = oldRefreshTokenPayload?.exp;
    await setTimeout(1000);

    const createNewAccessAndRefreshTokensResponse: {
      AT: string | undefined;
      RT: string | undefined;
      hasHttpOnly: boolean | undefined;
      hasSecure: boolean | undefined;
    } = await createNewAccessAndRefreshTokens(testApp.app, undefined, false, oldRefreshToken);

    const newAccessToken: string | undefined = createNewAccessAndRefreshTokensResponse.AT;
    const newRefreshToken: string | undefined = createNewAccessAndRefreshTokensResponse.RT;
    const newHasHttpOnly: boolean | undefined = createNewAccessAndRefreshTokensResponse.hasHttpOnly;
    const newHasSecure: boolean | undefined = createNewAccessAndRefreshTokensResponse.hasSecure;

    const newAccessTokenPayload: { userId: string; iat: Date; exp: Date } | null = decodeAccessToken(
      testApp.app,
      newAccessToken!
    );

    const newAccessTokenUserId: string | undefined = newAccessTokenPayload?.userId;
    const newAccessTokenIat: Date | undefined = newAccessTokenPayload?.iat;
    const newAccessTokenExp: Date | undefined = newAccessTokenPayload?.exp;

    const newRefreshTokenPayload: { userId: string; deviceId: string; iat: Date; exp: Date } | null =
      decodeRefreshToken(testApp.app, newRefreshToken!);

    const newRefreshTokenUserId: string | undefined = newRefreshTokenPayload?.userId;
    const newRefreshTokenDeviceId: string | undefined = newRefreshTokenPayload?.deviceId;
    const newRefreshTokenIat: Date | undefined = newRefreshTokenPayload?.iat;
    const newRefreshTokenExp: Date | undefined = newRefreshTokenPayload?.exp;
    const newSessionList: SessionList = await getSessionListByUserId(testApp.app, registeredUserId);
    const newSession: Session = newSessionList[0];
    const newSessionUserId: string = newSession.userId;
    const newSessionDeviceId: string = newSession.deviceId;
    const newSessionIat: Date = newSession.iat;
    const newSessionExp: Date = newSession.exp;

    const newSecurityDeviceList: SecurityDeviceList = await getSecurityDeviceListByUserId(
      testApp.app,
      registeredUserId
    );

    const newSecurityDevice: SecurityDevice = newSecurityDeviceList[0];
    const newSecurityDeviceId: string = newSecurityDevice.deviceId;
    const newSecurityDeviceUserId: string = newSecurityDevice.userId;
    const newSecurityDeviceLastActiveDate: Date = newSecurityDevice.lastActiveDate;
    expect(newAccessToken).toEqual(expect.any(String));
    expect(newRefreshToken).toEqual(expect.any(String));
    expect(newAccessToken).not.toBe(newRefreshToken);
    expect(newAccessToken).not.toBe(oldAccessToken);
    expect(newAccessToken).not.toBe(oldRefreshToken);
    expect(newRefreshToken).not.toBe(oldAccessToken);
    expect(newRefreshToken).not.toBe(oldRefreshToken);
    expect(newHasHttpOnly).toBe(true);
    expect(newHasSecure).toBe(true);
    expect(newAccessTokenUserId).toBe(registeredUserId);
    expect(newAccessTokenUserId).toBe(newRefreshTokenUserId);
    expect(newAccessTokenUserId).toBe(newSessionUserId);
    expect(newAccessTokenUserId).toBe(newSecurityDeviceUserId);
    expect(newAccessTokenIat).toEqual(newRefreshTokenIat);
    expect(newRefreshTokenIat).toEqual(newSessionIat);
    expect(newRefreshTokenIat).toEqual(newSecurityDeviceLastActiveDate);
    expect(newAccessTokenIat).not.toEqual(oldAccessTokenIat);
    expect(newRefreshTokenExp).toEqual(newSessionExp);
    expect(newRefreshTokenExp).not.toEqual(oldRefreshTokenExp);
    expect(newAccessTokenExp).not.toEqual(oldAccessTokenExp);
    expect(newAccessTokenExp).not.toEqual(oldRefreshTokenExp);
    expect(newRefreshTokenDeviceId).toBe(newSessionDeviceId);
    expect(newRefreshTokenDeviceId).toBe(newSecurityDeviceId);
    expect(newRefreshTokenDeviceId).toBe(oldRefreshTokenDeviceId);
    expect(newSessionList).toBeInstanceOf(Array);
    expect(newSessionList.length).toBe(1);
    expect(newSecurityDeviceList).toBeInstanceOf(Array);
    expect(newSecurityDeviceList.length).toBe(1);
  });

  it('✅ 010 should revoke a session when a correct refresh token passed; AuthController 008. POST', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse: {
      AT: string | undefined;
      RT: string | undefined;
      hasHttpOnly: boolean | undefined;
      hasSecure: boolean | undefined;
    } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO.login,
      password: createUserInputDTO.password,
    });

    const refreshToken: string | undefined = authUserByLoginOrEmailResponse.RT;
    await revokeSession(testApp.app, undefined, false, refreshToken);
    await createNewAccessAndRefreshTokens(testApp.app, HttpStatus.UNAUTHORIZED, false, refreshToken);
    const sessionList: SessionList = await getSessionListByUserId(testApp.app, registeredUserId);
    const securityDeviceList: SecurityDeviceList = await getSecurityDeviceListByUserId(testApp.app, registeredUserId);
    expect(sessionList).toBeInstanceOf(Array);
    expect(sessionList.length).toBe(0);
    expect(securityDeviceList).toBeInstanceOf(Array);
    expect(securityDeviceList.length).toBe(0);
  });

  it('✅ 011 should return user data when a correct access token passed; AuthController 009. GET', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    const createUserLogin: string = createUserInputDTO.login;
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse: { AT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserLogin,
      password: createUserInputDTO.password,
    });

    const authUserData: AuthUserDataOutputDTO = await getAuthUserDataByAccessToken(
      testApp.app,
      undefined,
      false,
      authUserByLoginOrEmailResponse.AT
    );

    expect(authUserData).toEqual({ login: createUserLogin, email: createUserInputDTO.email, userId: registeredUserId });
  });
});
