import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import {
  EmailConfirmation,
  EmailConfirmationList,
} from '../../../src/modules/user/domain/auth/email-confirmation.entity';

export const getEmailConfirmationListByUserId = async (
  app: NestExpressApplication,
  userId: string
): Promise<EmailConfirmationList> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(EmailConfirmation).find({ where: { userId }, order: { id: 'ASC' } });
};
