import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/users/users.entity';
import { AuthUserDataOutputDTO } from '../../../api/auth/output-dto/auth-user-data.output-dto';
import { GetAuthUserDataByAccessTokenQuery } from './get-auth-user-data-by-access-token.query';
import { UsersQueryRepository } from '../../../infrastructure/users/users.query-repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';

/*Обработчик запроса для получения данных о пользователе по ID пользователя при предоставлении AT.*/
@QueryHandler(GetAuthUserDataByAccessTokenQuery)
export class GetAuthUserDataByAccessTokenQueryHandler implements IQueryHandler<GetAuthUserDataByAccessTokenQuery> {
  public constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  public async execute({ id }: GetAuthUserDataByAccessTokenQuery): Promise<AuthUserDataOutputDTO> {
    /*Просим query-репозиторий "usersQueryRepository" найти пользователя по ID в БД.*/
    const user: User | null = await this.usersQueryRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileGettingAuthData,
        message: 'User to get auth data not found',
        field: 'id',
      });

    /*Если пользователь был найден, то преобразовываем пользователя из БД в подготовленные для отправки клиенту данные
    пользователя при предоставлении AT и возвращаем их.*/
    return AuthUserDataOutputDTO.mapFromUserToAuthUserDataOutputDTO(user);
  }
}
