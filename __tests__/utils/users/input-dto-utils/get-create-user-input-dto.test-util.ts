import { CreateUserInputDTO } from '../../../../src/modules/user/api/users/input-dto/create-user.input-dto';

export const getCreateUserInputDTO = (userDTO?: Partial<CreateUserInputDTO>): CreateUserInputDTO => {
  return {
    login: userDTO?.login ?? 'user01',
    password: userDTO?.password ?? 'qwe123ZXC456',
    email: userDTO?.email ?? 'user01@example.com',
  };
};
