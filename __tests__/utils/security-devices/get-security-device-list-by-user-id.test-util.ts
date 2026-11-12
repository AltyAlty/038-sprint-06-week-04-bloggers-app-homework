import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import {
  SecurityDevice,
  SecurityDeviceList,
} from '../../../src/modules/user/domain/security-devices/security-device.entity';

export const getSecurityDeviceListByUserId = async (
  app: NestExpressApplication,
  userId: string
): Promise<SecurityDeviceList> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(SecurityDevice).find({ where: { userId }, order: { deviceId: 'ASC' } });
};
