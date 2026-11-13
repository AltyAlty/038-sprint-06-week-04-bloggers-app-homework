import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { Session, SessionList } from '../../../src/modules/user/domain/auth/session.entity';

export const getSessionListByUserId = async (app: NestExpressApplication, userId: string): Promise<SessionList> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(Session).find({ where: { userId }, order: { id: 'ASC' } });
};
