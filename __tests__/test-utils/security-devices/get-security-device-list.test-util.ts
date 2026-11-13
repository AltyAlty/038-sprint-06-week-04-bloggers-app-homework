import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { SecurityDeviceListOutputDTO } from '../../../src/modules/user/api/security-devices/output-dto/security-device.output-dto';

export const getSecurityDeviceList = async (
  app: NestExpressApplication,
  expectedStatus?: HttpStatus,
  noRefreshToken?: boolean,
  refreshToken?: any
): Promise<SecurityDeviceListOutputDTO> => {
  const testStatus: HttpStatus = expectedStatus ?? HttpStatus.OK;
  const url: string = `/${SETTINGS.GLOBAL_PREFIX}/${SETTINGS.SECURITY_DEVICES_PREFIX}/${SETTINGS.SECURITY_DEVICES_GET_SECURITY_DEVICE_LIST_BY_USER_ID_PATH}`;
  let response: Response;

  if (noRefreshToken) {
    response = await request(app.getHttpServer()).get(url).expect(testStatus);
  } else {
    response = await request(app.getHttpServer())
      .get(url)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(testStatus);
  }

  return response.body as SecurityDeviceListOutputDTO;
};
