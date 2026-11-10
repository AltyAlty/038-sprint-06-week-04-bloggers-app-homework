import { NestExpressApplication } from '@nestjs/platform-express';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PaginationMetaDataOutputDTO } from '../../../src/core/pagination/output-dto/pagination-meta-data.output-dto';
import { UserListOutputDTO, UserOutputDTO } from '../../../src/modules/user/api/users/output-dto/user.output-dto';
import { validUserData, validUsersPaginationSettings } from '../../test-data/users.test-data';
import { doBeforeTests } from '../../utils/common/do-before-tests.test-util';
import { createConfirmedUserSA } from '../../utils/users/create-confirmed-user-sa.test-util';
import { deleteUserByIdSA } from '../../utils/users/delete-user-by-id-sa.test-util';
import { getUserListSA } from '../../utils/users/get-user-list-sa.test-util';

describe('Users SA API', (): void => {
  const testApp: { readonly app: NestExpressApplication } = doBeforeTests();

  it('✅ 001 should create a user when a valid basic auth token passed; UsersSaController 001. POST', async (): Promise<void> => {
    const createdUser: UserOutputDTO = await createConfirmedUserSA(testApp.app);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    expect(getUserListResponse.items[0]).toEqual(createdUser);
  });

  it('✅ 002 should return a list of users when a valid basic auth token passed; UsersSaController 002. GET', async (): Promise<void> => {
    await Promise.all([createConfirmedUserSA(testApp.app, validUserData.data_01), createConfirmedUserSA(testApp.app)]);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(2);
    expect(getUserListResponse.totalCount).toBe(2);
  });

  it('✅ 003 should return a list of users when valid pagination settings and a valid basic auth token passed; UsersSaController 002. GET', async (): Promise<void> => {
    const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.USERS_SA_PREFIX}/${SETTINGS.USERS_SA_GET_USER_LIST_PATH}?pageSize=${validUsersPaginationSettings.pageSize}&pageNumber=${validUsersPaginationSettings.pageNumber}&searchLoginTerm=${validUsersPaginationSettings.searchLoginTerm}&searchEmailTerm=${validUsersPaginationSettings.searchEmailTerm}&sortDirection=${validUsersPaginationSettings.sortDirection}&sortBy=${validUsersPaginationSettings.sortBy}`;

    await Promise.all([
      createConfirmedUserSA(testApp.app, validUserData.data_01),
      createConfirmedUserSA(testApp.app, validUserData.data_02),
      createConfirmedUserSA(testApp.app, validUserData.data_03),
      createConfirmedUserSA(testApp.app, validUserData.data_04),
      createConfirmedUserSA(testApp.app, validUserData.data_05),
      createConfirmedUserSA(testApp.app, validUserData.data_06),
    ]);

    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app, url);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(3);
    expect(getUserListResponse.totalCount).toBe(3);
    expect(getUserListResponse.items[0].login).toBe(validUserData.data_06.login);
    expect(getUserListResponse.items[1].login).toBe(validUserData.data_04.login);
    expect(getUserListResponse.items[2].login).toBe(validUserData.data_03.login);
  });

  it('✅ 004 should delete a user by a correct ID when a valid basic auth token passed; UsersSaController 003. DELETE', async (): Promise<void> => {
    const createdUser: UserOutputDTO = await createConfirmedUserSA(testApp.app);
    await deleteUserByIdSA(testApp.app, createdUser.id);
    const getUserListResponse: PaginationMetaDataOutputDTO<UserListOutputDTO> = await getUserListSA(testApp.app);
    expect(getUserListResponse.items).toBeInstanceOf(Array);
    expect(getUserListResponse.items.length).toBe(0);
  });
});
