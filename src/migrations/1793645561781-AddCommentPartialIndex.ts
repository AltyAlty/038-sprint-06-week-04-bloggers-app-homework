import { MigrationInterface, QueryRunner } from 'typeorm';

/*Создаем миграцию для добавления в таблицу комментариев частичного индекса, у которого поля направлены в разные
стороны, поскольку TypeORM не позволяет указывать направления.*/
export class AddCommentPartialIndex1793645561781 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*Создаем частичный индекс по полям "post_id", "created_at" и "id", так как часто используется запрос на получение
    комментариев в каком-то посте, где по умолчанию используется сортировка по полю "created_at" по убыванию и по полю
    "id" по возрастанию, при этом такой запрос не должен возвращать soft удаленных комментариев.*/
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_post_id_created_at_id_active" ON "comments" ("post_id", "created_at" DESC, "id" ASC) WHERE "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_comments_post_id_created_at_id_active"`);
  }
}
