import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { EmailConfirmation } from '../../domain/auth/email-confirmation.entity';
import { PasswordRecoveryCodeData } from '../../domain/auth/password-recovery-code-data.entity';
import { Session } from '../../domain/auth/session.entity';

/*Репозиторий для работы с аутентификацией и авторизацией.*/
@Injectable()
export class AuthRepository {
  public constructor(
    @InjectRepository(EmailConfirmation) private readonly emailConfirmationsRepository: Repository<EmailConfirmation>,
    @InjectRepository(PasswordRecoveryCodeData)
    private readonly passwordRecoveryCodesDataRepository: Repository<PasswordRecoveryCodeData>,
    @InjectRepository(Session) private readonly sessionsRepository: Repository<Session>
  ) {}

  /*Метод для сохранения данных о подтверждении регистрации пользователя в БД.*/
  public async saveEmailConfirmation(emailConfirmation: EmailConfirmation): Promise<void> {
    await this.emailConfirmationsRepository.upsert(emailConfirmation, ['id']);
  }

  /*Метод для сохранения данных о коде восстановления пароля пользователя в БД.*/
  public async savePasswordRecoveryCodeData(passwordRecoveryCodeData: PasswordRecoveryCodeData): Promise<void> {
    await this.passwordRecoveryCodesDataRepository.upsert(passwordRecoveryCodeData, ['id']);
  }

  /*Метод для сохранения пользовательской сессии в БД.*/
  public async saveSession(session: Session): Promise<void> {
    await this.sessionsRepository.upsert(session, ['id']);
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  public async findEmailConfirmationByUserId(userId: string): Promise<EmailConfirmation | null> {
    return this.emailConfirmationsRepository.findOneBy({ userId });
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по коду подтверждения регистрации пользователя в
  БД.*/
  public async findEmailConfirmationByCode(confirmationCode: string): Promise<EmailConfirmation | null> {
    return this.emailConfirmationsRepository.findOneBy({ confirmationCode });
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по ID пользователя в БД.*/
  public async findPasswordRecoveryCodeDataByUserId(userId: string): Promise<PasswordRecoveryCodeData | null> {
    return this.passwordRecoveryCodesDataRepository.findOneBy({ userId });
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по коду восстановления пароля пользователя в БД.*/
  public async findPasswordRecoveryCodeDataByPasswordRecoveryCode(
    passwordRecoveryCode: string
  ): Promise<PasswordRecoveryCodeData | null> {
    return this.passwordRecoveryCodesDataRepository.findOneBy({ passwordRecoveryCode });
  }

  /*Метод для поиска пользовательской сессии по ID пользователя, ID пользовательского устройства и дате выдачи RT в
  БД.*/
  public async findSessionByUserIdAndDeviceIdAndIat(
    userId: string,
    deviceId: string,
    iat: Date
  ): Promise<Session | null> {
    return this.sessionsRepository.findOneBy({ userId, deviceId, iat });
  }

  /*Метод для hard удаления всех данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  public async deleteAllEmailConfirmationsByUserId(userId: string): Promise<void> {
    await this.emailConfirmationsRepository.delete({ userId });
  }

  /*Метод для hard удаления всех данных о кодах восстановления пароля пользователя по ID пользователя в БД.*/
  public async deleteAllPasswordRecoveryCodesDataByUserId(userId: string): Promise<void> {
    await this.passwordRecoveryCodesDataRepository.delete({ userId });
  }

  /*Метод для hard удаления пользовательской сессии по ID пользователя, ID пользовательского устройства и дате выдачи RT
  в БД.*/
  public async deleteSessionByUserIdAndDeviceIdAndIat(userId: string, deviceId: string, iat: Date): Promise<void> {
    await this.sessionsRepository.delete({ userId, deviceId, iat });
  }

  /*Метод для hard удаления пользовательской сессии по ID пользователя и ID пользовательского устройства в БД.*/
  public async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<void> {
    await this.sessionsRepository.delete({ userId, deviceId });
  }

  /*Метод для hard удаления всех пользовательских сессий по ID пользователя и ID пользовательского устройства в БД.*/
  public async deleteAllSessionsExceptCurrentOneByUserIdAndSecurityDeviceId(
    userId: string,
    deviceId: string
  ): Promise<void> {
    await this.sessionsRepository.delete({ userId, deviceId: Not(deviceId) });
  }

  /*Метод для hard удаления всех пользовательских сессий по ID пользователя в БД.*/
  public async deleteAllSessionsByUserId(userId: string): Promise<void> {
    await this.sessionsRepository.delete({ userId });
  }

  /*Метод для hard удаления всех просроченных данных о подтверждении регистрации пользователей, у которых дата истечения
  прошла раньше указанной даты.*/
  public async deleteAllExpiredEmailConfirmations(expiredBeforeDate: Date): Promise<void> {
    await this.emailConfirmationsRepository.delete({ expirationDate: LessThan(expiredBeforeDate) });
  }

  /*Метод для hard удаления всех просроченных данных о кодах восстановления пароля пользователей, у которых дата
  истечения прошла раньше указанной даты.*/
  public async deleteAllExpiredPasswordRecoveryCodesData(expiredBeforeDate: Date): Promise<void> {
    await this.passwordRecoveryCodesDataRepository.delete({ expirationDate: LessThan(expiredBeforeDate) });
  }

  /*Метод для hard удаления всех просроченных пользовательских сессий, у которых дата истечения прошла раньше указанной
  даты.*/
  public async deleteAllExpiredSessions(expiredBeforeDate: Date): Promise<void> {
    await this.sessionsRepository.delete({ exp: LessThan(expiredBeforeDate) });
  }
}
