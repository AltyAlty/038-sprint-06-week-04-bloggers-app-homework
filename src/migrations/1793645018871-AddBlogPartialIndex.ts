import { MigrationInterface, QueryRunner } from 'typeorm';

/*Создаем миграцию для добавления в таблицу блогов частичного индекса, у которого поля направлены в разные стороны,
поскольку TypeORM не позволяет указывать направления.*/
export class AddBlogPartialIndex1793645018871 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*Создаем частичный индекс по полям "created_at" и "id", так как часто используется запрос на получение блогов, где
    по умолчанию используется сортировка по полю "created_at" по убыванию и по полю "id" по возрастанию, при этом такой
    запрос не должен возвращать soft удаленных блогов.*/
    await queryRunner.query(
      `CREATE INDEX "IDX_blogs_created_at_id_active" ON "blogs" ("created_at" DESC, "id" ASC) WHERE "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_blogs_created_at_id_active"`);
  }
}
