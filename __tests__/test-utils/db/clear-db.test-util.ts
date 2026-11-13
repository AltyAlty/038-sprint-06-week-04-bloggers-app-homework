import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

/*Функция для очистки БД и моков.*/
export const clearDb = async (app: NestExpressApplication): Promise<void> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);

  await dataSource.query(`
      TRUNCATE TABLE 
        public.comment_likes_data,
        public.post_likes_data,
        public.comments,
        public.posts,
        public.blogs,
        public.sessions,
        public.security_devices,
        public.password_recovery_codes_data,
        public.email_confirmations,
        public.users
      CASCADE;
    `);

  /*Сбрасываем историю вызовов у всех моков и шпионов.*/
  jest.clearAllMocks();
  /*Возвращаем оригинальные методы, подмененные через метод "jest.spyOn()".*/
  jest.restoreAllMocks();
};
