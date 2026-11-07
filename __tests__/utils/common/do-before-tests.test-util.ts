import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { appSetup } from '../../../src/setup/app.setup';
import { AppModule } from '../../../src/app.module';
import { clearDb } from '../db/clear-db.test-util';

/*Функция для предварительных действий перед запуском тестового набора.*/
export const doBeforeTests = (): { readonly app: NestExpressApplication } => {
  /*Создаем переменную для экземпляра приложения NestJS.*/
  let app: NestExpressApplication;

  /*Указываем, что будет происходить перед запуском каждого тестового набора.*/
  beforeAll(async (): Promise<void> => {
    /*Создаем изолированный NestJS DI-контейнер на основе модуля "AppModule".*/
    const testingModule: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    /*Создаем экземпляр приложения NestJS.*/
    app = testingModule.createNestApplication<NestExpressApplication>();
    /*Подключаем middleware для работы с cookies.*/
    app.use(cookieParser());
    /*Просим NestJS доверять заголовкам от прокси, чтобы правильно определять реальный IP пользователя и протокол вместо
    того, чтобы видеть IP самого прокси-сервера. Теперь NestJS будет брать на себя всю работу с заголовком
    "x-forwarded-for", и доставать из него реальный IP клиента и записывает его напрямую в свойство "request.ip".*/
    app.set('trust proxy', true);
    /*Настраиваем экземпляр приложения NestJS.*/
    appSetup(app);
    /*Запускаем приложение NestJS и подключаем его к БД.*/
    await app.init();
    /*Очищаем БД и моки.*/
    await clearDb(app);
  });

  /*Указываем, что будет происходить перед запуском каждого теста.*/
  beforeEach(async (): Promise<void> => {
    /*Очищаем БД и моки.*/
    await clearDb(app);
  });

  /*Указываем, что будет происходить после того как каждый тестовый набор отработает.*/
  afterAll(async (): Promise<void> => {
    /*Очищаем БД и моки.*/
    await clearDb(app);
    /*Отключаем приложение NestJS.*/
    await app.close();
  });

  /*Поскольку приложение NestJS инициализируется асинхронно внутри блока "beforeAll", то на момент выполнения return
  переменная "app" еще не определена. Поэтому используем геттер, чтобы была возможность получать актуальное значение
  в момент обращения.*/
  return {
    get app(): NestExpressApplication {
      return app;
    },
  };
};
