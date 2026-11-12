import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { Session } from '../../../src/modules/user/domain/auth/session.entity';

export const hasAnySessionByUserId = async (app: NestExpressApplication, userId: string): Promise<boolean> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(Session).exists({ where: { userId } });
};
