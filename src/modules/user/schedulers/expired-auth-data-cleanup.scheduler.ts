import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthRepository } from '../infrastructure/auth/auth.repository';

/*Класс для планировщика на основе модуля @nestjs/schedule, который раз в час удаляет из БД записи, истекшие более суток
назад:
1. Данные о подтверждении регистрации пользователей.
2. Данные о кодах восстановления пароля пользователей
3. Пользовательские сессии.*/
@Injectable()
export class ExpiredAuthDataCleanupScheduler {
  private readonly logger: Logger = new Logger(ExpiredAuthDataCleanupScheduler.name);
  public constructor(private readonly authRepository: AuthRepository) {}

  @Cron(CronExpression.EVERY_HOUR)
  public async cleanup(): Promise<void> {
    try {
      /*Должны удалять данные, которые истекли сутки или более назад, то есть должны проверять условие:
      expirationDate < Date.now() - 24 часа. Для этого создаем переменную, которая будет хранить правую часть условия,
      где 24 часа представлены как 86 400 000 мс.*/
      const expiredBeforeDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000);

      /*Запускаем параллельное удаление просроченных данных.*/
      await Promise.all([
        this.authRepository.deleteAllExpiredEmailConfirmations(expiredBeforeDate),
        this.authRepository.deleteAllExpiredPasswordRecoveryCodesData(expiredBeforeDate),
        this.authRepository.deleteAllExpiredSessions(expiredBeforeDate),
      ]);
    } catch (error: unknown) {
      this.logger.error('Error during deleting expired data', error);
    }
  }
}
