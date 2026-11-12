import { SendPasswordRecoveryCodeInputDTO } from '../../../../src/modules/user/api/auth/input-dto/send-password-recovery-code.input-dto';

export const getSendPasswordRecoveryCodeInputDTO = (): SendPasswordRecoveryCodeInputDTO => {
  return { email: 'user01@example.com' };
};
