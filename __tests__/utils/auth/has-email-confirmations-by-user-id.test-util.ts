import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { EmailConfirmation } from '../../../src/modules/user/domain/auth/email-confirmation.entity';

export const hasEmailConfirmationsByUserId = async (app: NestExpressApplication, userId: string): Promise<boolean> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(EmailConfirmation).exists({ where: { userId } });
};
