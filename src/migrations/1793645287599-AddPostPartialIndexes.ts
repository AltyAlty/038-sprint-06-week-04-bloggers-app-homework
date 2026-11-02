import { MigrationInterface, QueryRunner } from 'typeorm';

/*Создаем миграцию для добавления в таблицу постов частичных индексов, у которых поля направлены в разные стороны,
поскольку TypeORM не позволяет указывать направления.*/
export class AddPostPartialIndexes1793645287599 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*Создаем частичный индекс по полям "blog_id", "created_at" и "id", так как часто используется запрос на получение
    постов в каком-то блоге, где по умолчанию используется сортировка по полю "created_at" по убыванию и по полю "id" по
    возрастанию, при этом такой запрос не должен возвращать soft удаленных постов.*/
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_blog_id_created_at_id_active" ON "posts" ("blog_id", "created_at" DESC, "id" ASC) WHERE "deleted_at" IS NULL`
    );

    /*Создаем частичный индекс по полям "created_at" и "id", так как часто используется запрос на получение постов, где
    по умолчанию используется сортировка по полю "created_at" по убыванию и по полю "id" по возрастанию, при этом такой
    запрос не должен возвращать soft удаленных постов.*/
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_created_at_id_active" ON "posts" ("created_at" DESC, "id" ASC) WHERE "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_created_at_id_active"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_blog_id_created_at_id_active"`);
  }
}
