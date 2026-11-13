import { AuthUserByLoginOrEmailInputDTO } from '../../../../src/modules/user/api/auth/input-dto/auth-user-by-login-or-email.input-dto';

export const getAuthUserByLoginOrEmailInputDTO = (): AuthUserByLoginOrEmailInputDTO => {
  return {
    loginOrEmail: 'user01',
    password: 'password001',
  };
};
