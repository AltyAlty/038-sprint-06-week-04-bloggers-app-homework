import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setTimeout } from 'timers/promises';
import { EmailConfirmationList } from '../../../src/modules/user/domain/auth/email-confirmation.entity';
import { Session, SessionList } from '../../../src/modules/user/domain/auth/session.entity';
import { SecurityDeviceList } from '../../../src/modules/user/domain/security-devices/security-device.entity';
import { CreateUserInputDTO } from '../../../src/modules/user/api/users/input-dto/create-user.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import {
  SecurityDeviceListOutputDTO,
  SecurityDeviceOutputDTO,
} from '../../../src/modules/user/api/security-devices/output-dto/security-device.output-dto';
import { UserListOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { validUserAgents } from '../../test-data/auth.test-data';
import { authUserByLoginOrEmail } from '../../utils/auth/auth-user-by-login-or-email.test-util';
import { confirmUserByCode } from '../../utils/auth/confirm-user-by-code.test-util';
import { decodeRefreshToken } from '../../utils/auth/decode-refresh-token.test-util';
import { getEmailConfirmationListByUserId } from '../../utils/auth/get-email-confirmation-list-by-user-id.test-util';
import { getSessionListByUserId } from '../../utils/auth/get-session-list-by-user-id.test-util';
import { registerUser } from '../../utils/auth/register-user.test-util';
import { revokeAllSessionsExceptCurrentOne } from '../../utils/auth/revoke-all-sessions-except-current-one.test-util';
import { revokeSessionBySecurityDeviceIdList } from '../../utils/auth/revoke-session-by-security-device-id-list.test-util';
import { doBeforeTests } from '../../utils/common/do-before-tests.test-util';
import { getSecurityDeviceList } from '../../utils/security-devices/get-security-device-list.test-util';
import { getSecurityDeviceListByUserId } from '../../utils/security-devices/get-security-device-list-by-user-id.test-util';
import { getUserListSA } from '../../utils/users/get-user-list-sa.test-util';
import { getCreateUserInputDTO } from '../../utils/users/input-dto-utils/get-create-user-input-dto.test-util';

describe('Security Devices API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should return a list of security devices when a correct refresh token passed; AuthController 001. GET', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse_01: { RT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      { loginOrEmail: createUserInputDTO.login, password: createUserInputDTO.password },
      undefined,
      false,
      validUserAgents.userAgent_01
    );

    await setTimeout(1000);

    const authUserByLoginOrEmailResponse_02: { RT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      { loginOrEmail: createUserInputDTO.login, password: createUserInputDTO.password },
      undefined,
      false,
      validUserAgents.userAgent_02
    );

    const refreshToken_01: string | undefined = authUserByLoginOrEmailResponse_01.RT;
    const refreshToken_02: string | undefined = authUserByLoginOrEmailResponse_02.RT;

    const refreshTokenPayload_01: { userId: string; deviceId: string; iat: Date; exp: Date } | null =
      decodeRefreshToken(testApp.app, refreshToken_01!);

    const refreshTokenPayload_02: { userId: string; deviceId: string; iat: Date; exp: Date } | null =
      decodeRefreshToken(testApp.app, refreshToken_02!);

    const refreshTokenDeviceId_01: string | undefined = refreshTokenPayload_01?.deviceId;
    const refreshTokenDeviceId_02: string | undefined = refreshTokenPayload_02?.deviceId;
    const refreshTokenIat_01: Date | undefined = refreshTokenPayload_01?.iat;
    const refreshTokenIat_02: Date | undefined = refreshTokenPayload_02?.iat;

    const securityDeviceList: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      testApp.app,
      undefined,
      false,
      refreshToken_01
    );

    const securityDevice_01: SecurityDeviceOutputDTO = securityDeviceList[0];
    const securityDevice_02: SecurityDeviceOutputDTO = securityDeviceList[1];
    const securityDeviceId_01: string = securityDevice_01.deviceId;
    const securityDeviceId_02: string = securityDevice_02.deviceId;
    const securityDeviceLastActiveDate_01: Date = new Date(securityDevice_01.lastActiveDate);
    const securityDeviceLastActiveDate_02: Date = new Date(securityDevice_02.lastActiveDate);
    expect(securityDeviceList).toBeInstanceOf(Array);
    expect(securityDeviceList.length).toBe(2);
    expect(securityDeviceId_01).toBe(refreshTokenDeviceId_01);
    expect(securityDeviceId_02).toBe(refreshTokenDeviceId_02);
    expect(securityDeviceId_01).not.toBe(securityDeviceId_02);
    expect(securityDeviceLastActiveDate_01).toEqual(refreshTokenIat_01);
    expect(securityDeviceLastActiveDate_02).toEqual(refreshTokenIat_02);
    expect(securityDeviceLastActiveDate_01).not.toEqual(securityDeviceLastActiveDate_02);
  });

  it('✅ 002 should revoke a session by a correct security device ID; AuthController 002. DELETE', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse: { RT: string | undefined } = await authUserByLoginOrEmail(testApp.app, {
      loginOrEmail: createUserInputDTO.login,
      password: createUserInputDTO.password,
    });

    const refreshToken: string | undefined = authUserByLoginOrEmailResponse.RT;

    const refreshTokenPayload: { userId: string; deviceId: string; iat: Date; exp: Date } | null = decodeRefreshToken(
      testApp.app,
      refreshToken!
    );

    await revokeSessionBySecurityDeviceIdList(
      testApp.app,
      refreshTokenPayload?.deviceId,
      undefined,
      false,
      refreshToken
    );

    await getSecurityDeviceList(testApp.app, HttpStatus.UNAUTHORIZED, false, refreshToken);
    const securityDeviceList: SecurityDeviceList = await getSecurityDeviceListByUserId(testApp.app, registeredUserId);
    const sessionList: SessionList = await getSessionListByUserId(testApp.app, registeredUserId);
    expect(securityDeviceList).toBeInstanceOf(Array);
    expect(securityDeviceList.length).toBe(0);
    expect(sessionList).toBeInstanceOf(Array);
    expect(sessionList.length).toBe(0);
  });

  it('✅ 003 should revoke all sessions except a current one by a correct security device ID; AuthController 003. DELETE', async (): Promise<void> => {
    const createUserInputDTO: CreateUserInputDTO = getCreateUserInputDTO();
    await registerUser(testApp.app, createUserInputDTO);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    const registeredUserId: string = getUserListResponse.items[0].id;

    const emailConfirmationList: EmailConfirmationList = await getEmailConfirmationListByUserId(
      testApp.app,
      registeredUserId
    );

    await confirmUserByCode(testApp.app, { code: emailConfirmationList[0].confirmationCode });

    const authUserByLoginOrEmailResponse_01: { RT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      { loginOrEmail: createUserInputDTO.login, password: createUserInputDTO.password },
      undefined,
      false,
      validUserAgents.userAgent_01
    );

    await setTimeout(1000);

    const authUserByLoginOrEmailResponse_02: { RT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      { loginOrEmail: createUserInputDTO.login, password: createUserInputDTO.password },
      undefined,
      false,
      validUserAgents.userAgent_02
    );

    await setTimeout(1000);

    const authUserByLoginOrEmailResponse_03: { RT: string | undefined } = await authUserByLoginOrEmail(
      testApp.app,
      { loginOrEmail: createUserInputDTO.login, password: createUserInputDTO.password },
      undefined,
      false,
      validUserAgents.userAgent_03
    );

    const refreshToken: string | undefined = authUserByLoginOrEmailResponse_02.RT;

    const refreshTokenPayload: { userId: string; deviceId: string; iat: Date; exp: Date } | null = decodeRefreshToken(
      testApp.app,
      refreshToken!
    );

    const refreshTokenUserId: string | undefined = refreshTokenPayload?.userId;
    const refreshTokenDeviceId: string | undefined = refreshTokenPayload?.deviceId;
    const refreshTokenIat: Date | undefined = refreshTokenPayload?.iat;

    await revokeAllSessionsExceptCurrentOne(testApp.app, undefined, false, refreshToken);
    await getSecurityDeviceList(testApp.app, HttpStatus.UNAUTHORIZED, false, authUserByLoginOrEmailResponse_01.RT);

    const securityDeviceList: SecurityDeviceListOutputDTO = await getSecurityDeviceList(
      testApp.app,
      undefined,
      false,
      refreshToken
    );

    await getSecurityDeviceList(testApp.app, HttpStatus.UNAUTHORIZED, false, authUserByLoginOrEmailResponse_03.RT);
    const securityDevice: SecurityDeviceOutputDTO = securityDeviceList[0];
    const securityDeviceId: string = securityDevice.deviceId;
    const securityDeviceLastActiveDate: Date = new Date(securityDevice.lastActiveDate);
    const sessionList: SessionList = await getSessionListByUserId(testApp.app, registeredUserId);
    const session: Session = sessionList[0];
    const sessionUserId: string = session.userId;
    expect(securityDeviceList).toBeInstanceOf(Array);
    expect(securityDeviceList.length).toBe(1);
    expect(sessionList).toBeInstanceOf(Array);
    expect(sessionList.length).toBe(1);
    expect(securityDeviceId).toBe(refreshTokenDeviceId);
    expect(securityDeviceLastActiveDate).toEqual(refreshTokenIat);
    expect(sessionUserId).toBe(refreshTokenUserId);
  });
});
