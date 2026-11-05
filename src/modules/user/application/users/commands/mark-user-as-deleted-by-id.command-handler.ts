import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/users/users.entity';
import { MarkUserAsDeletedByIdCommand } from './mark-user-as-deleted-by-id.command';
import { CommentsRepository } from '../../../../blog/infrastructure/comments/comments.repository';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';

/*Обработчик команды для soft удаления пользователя по ID.*/
@CommandHandler(MarkUserAsDeletedByIdCommand)
export class MarkUserAsDeletedByIdCommandHandler implements ICommandHandler<MarkUserAsDeletedByIdCommand> {
  public constructor(
    private readonly authRepository: AuthRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  public async execute({ id }: MarkUserAsDeletedByIdCommand): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: User | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Просим репозиторий "CommentsRepository" soft удалить все данные о лайках комментариев по ID пользователя в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByUserId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить все комментарии по ID пользователя в БД.*/
    await this.commentsRepository.markAllAsDeletedByUserId(id);
    /*Просим репозиторий "AuthRepository" hard удалить все данные о подтверждении регистрации пользователя в БД.*/
    await this.authRepository.deleteAllEmailConfirmationsByUserId(id);
    /*Просим репозиторий "AuthRepository" hard удалить все данные о кодах восстановления пароля пользователя в БД.*/
    await this.authRepository.deleteAllPasswordRecoveryCodesDataByUserId(id);
    /*Просим репозиторий "securityDevicesRepository" hard удалить все пользовательские устройства по ID пользователя в
    БД.*/
    await this.securityDevicesRepository.deleteAllByUserId(id);
    /*Просим репозиторий "AuthRepository" hard удалить все пользовательские сессии по ID пользователя в БД.*/
    await this.authRepository.deleteAllSessionsByUserId(id);
    /*Если пользователь был найден, то просим репозиторий "UsersRepository" soft удалить пользователя по ID в БД.*/
    await this.usersRepository.markAsDeletedById(id);
  }
}
