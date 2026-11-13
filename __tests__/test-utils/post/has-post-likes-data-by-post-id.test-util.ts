import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { PostLikeData } from '../../../src/modules/blog/domain/posts/post-like-data.entity';

export const hasPostLikesDataByPostId = async (app: NestExpressApplication, postId: string): Promise<boolean> => {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  return dataSource.getRepository(PostLikeData).exists({ where: { postId } });
};
