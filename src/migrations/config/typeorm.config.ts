import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { z } from 'zod';

config({ path: __dirname + '/../../../.env.development.local' });

/*Описываем схему для файла ".env", используя библиотеку Zod, чтобы проверять типы значений в этом файле в рантайме.*/
const envSchema = z.object({
  POSTGRESQL_DB_HOST: z.string(),
  POSTGRESQL_DB_PORT: z.coerce.number(),
  POSTGRESQL_DB_USERNAME: z.string(),
  POSTGRESQL_DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

/*Проверяем переменную "process.env" по схеме: если все переменные на месте и типы корректны, то возвращаем
типизированный объект, иначе выбрасываем ошибку с описанием проблемы.*/
const env = envSchema.parse(process.env);

/*Создаем отдельный конфиг для CLI-команд миграций, так как CLI TypeORM не знает, как подключиться к БД и где лежат
сущности.*/
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.POSTGRESQL_DB_HOST,
  port: env.POSTGRESQL_DB_PORT,
  username: env.POSTGRESQL_DB_USERNAME,
  password: env.POSTGRESQL_DB_PASSWORD,
  database: env.DB_NAME,
  /*Указываем путь ко всем сущностям в приложении, так как опция "autoLoadEntities" не работает вне NestJS.*/
  entities: [__dirname + '/../../**/*.entity.ts'],
  /*Указываем папку для миграций.*/
  migrations: [__dirname + '/../*.ts'],
  synchronize: false,
});
