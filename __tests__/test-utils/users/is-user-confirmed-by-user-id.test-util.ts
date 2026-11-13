import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { User } from '../../../src/modules/user/domain/users/users.entity';

export const isUserConfirmedByUserIdTestUtil = async (
  app: NestExpressApplication,
  userId: string
): Promise<boolean> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(User).exists({ where: { id: userId, isConfirmed: true } });
};
