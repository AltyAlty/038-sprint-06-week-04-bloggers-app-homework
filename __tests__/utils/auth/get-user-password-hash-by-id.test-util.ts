import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { User } from '../../../src/modules/user/domain/users/users.entity';

export const getUserPasswordHashById = async (app: NestExpressApplication, userId: string): Promise<string | null> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);

  const user: User | null = await dataSource
    .getRepository(User)
    .findOne({ select: { passwordHash: true }, where: { id: userId } });

  return user?.passwordHash ?? null;
};
