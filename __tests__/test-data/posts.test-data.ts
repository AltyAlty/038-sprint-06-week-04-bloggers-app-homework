import { v7 } from 'uuid';

export const validPostsPaginationSettings = {
  pageSize: 5,
  pageNumber: 1,
  sortDirection: 'asc',
  sortBy: 'title',
};

export const invalidPostsPaginationSettings = {
  pageSize: 101,
  pageNumber: -1,
  sortDirection: 'cas',
  sortBy: 'description',
};

export const validPostIds = { id_01: v7() };

export const invalidPostIds = {
  id_01: 'ABC',
  id_02: 2,
  id_03: null,
  id_04: '   ',
};

export const validPostTitles = {
  title_01: 'blog name 01',
  title_02: 'blog name 02',
  title_03: 'blog name 03',
  title_04: 'blog name 04',
  title_05: 'blog name 05',
  title_06: 'blog name 06',
};

export const invalidPostTitles = {
  title_01: '',
  title_02: '   ',
  title_03: '0123456789012345678901234567890',
  title_04: '012345678901234567890123456789000000',
  title_05: null,
};

export const invalidPostShortDescriptions = {
  shortDescription_01: '',
  shortDescription_02: '   ',
  shortDescription_03: null,
};

export const invalidPostContents = {
  content_01: '',
  content_02: '   ',
  content_03: null,
};

export const invalidPostLikesData = {
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
