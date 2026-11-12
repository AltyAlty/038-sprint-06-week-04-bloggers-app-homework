import { ResendConfirmationEmailInputDTO } from '../../../../src/modules/user/api/auth/input-dto/resend-confirmation-email.input-dto';

export const getResendConfirmationEmailInputDTO = (): ResendConfirmationEmailInputDTO => {
  return { email: 'user01@example.com' };
};
