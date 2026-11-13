import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { PasswordRecoveryCodeData } from '../../../src/modules/user/domain/auth/password-recovery-code-data.entity';

export const hasPasswordRecoveryCodesDataByUserId = async (
  app: NestExpressApplication,
  userId: string
): Promise<boolean> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(PasswordRecoveryCodeData).exists({ where: { userId } });
};
