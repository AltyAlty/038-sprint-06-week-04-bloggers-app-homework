import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { SecurityDevice } from '../../../src/modules/user/domain/security-devices/security-device.entity';

export const hasAnySecurityDeviceByUserId = async (app: NestExpressApplication, userId: string): Promise<boolean> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(SecurityDevice).exists({ where: { userId } });
};
