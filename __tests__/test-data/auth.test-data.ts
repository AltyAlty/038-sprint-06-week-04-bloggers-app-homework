import { add } from 'date-fns/add';
import { v7 } from 'uuid';

export const invalidBasicAuthTokens = { BAT_01: 'token' };

export const invalidAccessTokens = {
  AT_01: '',
  AT_02: '   ',
  AT_03: 'token',
  AT_04: 2,
  AT_05: null,
  AT_06: undefined,
  AT_07: [],
  AT_08: {},
};

export const invalidRefreshTokens = {
  RT_01: '',
  RT_02: '   ',
  RT_03: 'token',
  RT_04: 2,
  RT_05: null,
  RT_06: undefined,
  RT_07: [],
  RT_08: {},
};

export const invalidConfirmationCodes = {
  code_01: '',
  code_02: '   ',
  code_03: '0123456789111111',
  code_04: '!@#$%^&*()',
  code_05: 'ab',
  code_06: null,
  code_07: undefined,
  code_08: 1234567890,
};

export const validUserAgents = {
  userAgent_01: 'test-user-agent_01',
  userAgent_02: 'test-user-agent_02',
  userAgent_03: 'test-user-agent_03',
  userAgent_04: 'test-user-agent_04',
};

export const invalidUserAgents = {
  userAgent_01: '',
  userAgent_02: '   ',
};

export const validUUIDv7RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validUUIDs = { uuid_01: '01900000-0000-7000-8000-000000000001' };

export const expiredUserEmailConfirmationData = {
  confirmationCode: v7(),
  expirationDate: add(new Date(), { seconds: -1 }),
};

export const invalidRecoveryCodes = {
  code_01: '',
  code_02: '   ',
  code_03: '0123456789111111',
  code_04: '!@#$%^&*()',
  code_05: 'ab',
  code_06: null,
  code_07: undefined,
  code_08: 1234567890,
};

export const expiredRecoveryCodeData = {
  recoveryCode: v7(),
  expirationDate: add(new Date(), { seconds: -1 }),
};

export const invalidJwtSingOptions = {
  expired: { expiresIn: -10 },
  wrongSecret: { secret: 'wrong-secret' },
};
