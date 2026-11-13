import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { CommentLikeData } from '../../../src/modules/blog/domain/comments/comment-like-data.entity';

export const hasAnyCommentLikeDataByCommentId = async (
  app: NestExpressApplication,
  commentId: string
): Promise<boolean> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(CommentLikeData).exists({ where: { commentId } });
};
