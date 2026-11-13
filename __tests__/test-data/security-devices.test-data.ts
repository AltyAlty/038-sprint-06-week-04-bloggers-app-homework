import { v7 } from 'uuid';

export const validDeviceIds = { id_01: v7() };

export const invalidDeviceIds = {
  id_01: 'ABC',
  id_02: 2,
  id_03: null,
};
