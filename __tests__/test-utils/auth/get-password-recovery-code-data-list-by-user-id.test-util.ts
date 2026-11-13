import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import {
  PasswordRecoveryCodeData,
  PasswordRecoveryCodeDataList,
} from '../../../src/modules/user/domain/auth/password-recovery-code-data.entity';

export const getPasswordRecoveryCodeDataListByUserIdTestUtil = async (
  app: NestExpressApplication,
  userId: string
): Promise<PasswordRecoveryCodeDataList> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(PasswordRecoveryCodeData).find({ where: { userId }, order: { id: 'ASC' } });
};
