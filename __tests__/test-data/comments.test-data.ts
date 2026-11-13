import { v7 } from 'uuid';

export const validCommentsPaginationSettings = {
  pageSize: 5,
  pageNumber: 1,
  sortDirection: 'asc',
  sortBy: 'content',
};

export const invalidCommentsPaginationSettings = {
  pageSize: 101,
  pageNumber: -1,
  sortDirection: 'cas',
  sortBy: 'description',
};

export const validCommentIds = { id_01: v7() };

export const invalidCommentIds = {
  id_01: 'ABC',
  id_02: 2,
  id_03: null,
};

export const validCommentContents = {
  content_01: 'random comment content 001',
  content_02: 'random comment content 002',
  content_03: 'random comment content 003',
  content_04: 'random comment content 004',
  content_05: 'random comment content 005',
  content_06: 'random comment content 006',
};

export const invalidCommentContents = {
  content_01: 'qwe123zxc',
  content_02: '',
  content_03: '   ',
  content_04: 'ABC',
  content_05: '1234567890',
  content_06: [],
  content_07: {},
  content_08: null,
  content_09: undefined,
  content_10: 1234567890,
};

export const invalidCommentLikesData = {
  data_01: 'qwe123zxc',
  data_02: '',
  data_03: '   ',
  data_04: 'ABC',
  data_05: '1234567890',
  data_06: [],
  data_07: {},
  data_08: null,
  data_09: undefined,
  data_10: 1234567890,
};
