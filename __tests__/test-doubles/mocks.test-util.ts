/*Моковый менеджер для работы с библиотекой nodemailer.*/
export const emailManagerMock = {
  sendCompleteRegistrationEmail: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
  sendPasswordRecoveryEmail: jest.fn<Promise<boolean>, [string, string]>().mockResolvedValue(true),
};
