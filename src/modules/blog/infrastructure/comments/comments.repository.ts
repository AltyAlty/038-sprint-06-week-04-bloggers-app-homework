import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/comments/comment.entity';
import { CommentLikeData } from '../../domain/comments/comment-like-data.entity';

/*Репозиторий для комментариев в PostgreSQL.*/
@Injectable()
export class CommentsRepository {
  public constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLikeData) private readonly commentLikesDataRepository: Repository<CommentLikeData>
  ) {}

  /*Метод для сохранения комментария в БД.*/
  public async save(comment: Comment): Promise<void> {
    await this.commentsRepository.upsert(comment, ['id']);
  }

  /*Метод для сохранения данных о лайке комментария в БД.*/
  public async saveCommentLikeData(commentLikeData: CommentLikeData): Promise<void> {
    await this.commentLikesDataRepository.upsert(commentLikeData, ['id']);
  }

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findOneBy({ id });
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeData | null> {
    return this.commentLikesDataRepository.findOneBy({ commentId, userId });
  }

  /*Метод для soft удаления комментария по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.commentsRepository.softDelete(id);
  }

  /*Метод для hard удаления комментария по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.commentsRepository.delete(id);
  }

  /*Метод для soft удаления всех комментариев по ID поста в БД.*/
  public async markAllAsDeletedByPostId(postId: string): Promise<void> {
    await this.commentsRepository.softDelete({ postId });
  }

  /*Метод для hard удаления всех комментариев по ID поста в БД.*/
  public async deleteAllByPostId(postId: string): Promise<void> {
    await this.commentsRepository.delete({ postId });
  }

  /*Метод для soft удаления всех комментариев по ID блога в БД.*/
  public async markAllAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.commentsRepository.softDelete({ blogId });
  }

  /*Метод для hard удаления всех комментариев по ID блога в БД.*/
  public async deleteAllByBlogId(blogId: string): Promise<void> {
    await this.commentsRepository.delete({ blogId });
  }

  /*Метод для soft удаления всех комментариев по ID пользователя в БД.*/
  public async markAllAsDeletedByUserId(userId: string): Promise<void> {
    await this.commentsRepository.softDelete({ userId });
  }

  /*Метод для hard удаления всех комментариев по ID пользователя в БД.*/
  public async deleteAllByUserId(userId: string): Promise<void> {
    await this.commentsRepository.delete({ userId });
  }

  /*Метод для soft удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async markCommentLikeDataAsDeletedByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ commentId, userId });
  }

  /*Метод для hard удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async deleteCommentLikeDataByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ commentId, userId });
  }

  /*Метод для soft удаления всех данных о лайках комментария по ID комментария в БД.*/
  public async markAllCommentLikesDataAsDeletedByCommentId(commentId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ commentId });
  }

  /*Метод для hard удаления всех данных о лайках комментария по ID комментария в БД.*/
  public async deleteAllCommentLikesDataByCommentId(commentId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ commentId });
  }

  /*Метод для soft удаления всех данных о лайках комментариев по ID поста в БД.*/
  public async markAllCommentsLikesDataAsDeletedByPostId(postId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ postId });
  }

  /*Метод для hard удаления всех данных о лайках комментариев по ID поста в БД.*/
  public async deleteAllCommentsLikesDataByPostId(postId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ postId });
  }

  /*Метод для soft удаления всех данных о лайках комментариев по ID блога в БД.*/
  public async markAllCommentsLikesDataAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ blogId });
  }

  /*Метод для hard удаления всех данных о лайках комментариев по ID блога в БД.*/
  public async deleteAllCommentsLikesDataByBlogId(blogId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ blogId });
  }

  /*Метод для soft удаления всех данных о лайках комментариев по ID пользователя в БД.*/
  public async markAllCommentsLikesDataAsDeletedByUserId(userId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ userId });
  }

  /*Метод для hard удаления всех данных о лайках комментариев по ID пользователя в БД.*/
  public async deleteAllCommentsLikesDataByUserId(userId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ userId });
  }

  /*Метод для soft удаления всех данных о лайках комментариев, созданных пользователем, по ID этого пользователя в БД.*/
  public async markAllCommentsLikesDataAsDeletedByCommentsAuthorId(authorId: string): Promise<void> {
    const commentsSubQuery: string = this.commentsRepository
      .createQueryBuilder('comment')
      .select('comment.id')
      .withDeleted()
      .where('comment.userId = :authorId')
      .getQuery();

    await this.commentLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where(`"comment_id" IN (${commentsSubQuery})`)
      .andWhere('"deleted_at" IS NULL')
      .setParameter('authorId', authorId)
      .execute();
  }

  /*Метод для hard удаления всех данных о лайках комментариев, созданных пользователем, по ID этого пользователя в БД.*/
  public async deleteAllCommentsLikesDataByCommentsAuthorId(authorId: string): Promise<void> {
    const commentsSubQuery: string = this.commentsRepository
      .createQueryBuilder('comment')
      .select('comment.id')
      .withDeleted()
      .where('comment.userId = :authorId')
      .getQuery();

    await this.commentLikesDataRepository
      .createQueryBuilder()
      .delete()
      .where(`"comment_id" IN (${commentsSubQuery})`)
      .andWhere('"deleted_at" IS NULL')
      .setParameter('authorId', authorId)
      .execute();
  }
}
