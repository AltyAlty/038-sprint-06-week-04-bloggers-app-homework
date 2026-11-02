import { MigrationInterface, QueryRunner } from 'typeorm';

/*Создаем миграцию для добавления в таблицу пользователей GIN индексов и частичного индекса.*/
export class AddUserIndexes1793647259484 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*Включаем расширение pg_trgm, если еще не включено.*/
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    /*Создаем GIN индекс на поле "login", который нужен при поиске пользователей с оператором "ILIKE", поскольку B-Tree
    не может ускорять такой поиск по следующим причинам:
    1. Поиск идет не по началу строки
    2. Опция "collation 'C'" на поле "login" использует побайтовое сравнение, из-за чего B-Tree не может ускорить
    регистронезависимый поиск через "ILIKE", так как заглавные и строчные буквы лежат в разных местах индекса.*/
    await queryRunner.query(`CREATE INDEX "IDX_users_login_trgm" ON "users" USING GIN ("login" gin_trgm_ops)`);
    /*Создаем GIN индекс на поле "email", который нужен при поиске пользователей с оператором "ILIKE", поскольку B-Tree
    не может ускорять такой поиск по следующим причинам:
    1. Поиск идет не по началу строки
    2. Опция "collation 'C'" на поле "email" использует побайтовое сравнение, из-за чего B-Tree не может ускорить
    регистронезависимый поиск через "ILIKE", так как заглавные и строчные буквы лежат в разных местах индекса.*/
    await queryRunner.query(`CREATE INDEX "IDX_users_email_trgm" ON "users" USING GIN ("email" gin_trgm_ops)`);

    /*Создаем GIN индекс на поле "original_email", который нужен при поиске пользователей с оператором "ILIKE",
    поскольку B-Tree не может ускорять такой поиск так как поиск идет не по началу строки.*/
    await queryRunner.query(
      `CREATE INDEX "IDX_users_original_email_trgm" ON "users" USING GIN ("original_email" gin_trgm_ops)`
    );

    /*Создаем частичный индекс по полям "created_at" и "id", так как часто используется запрос на получение
    пользователей, где по умолчанию используется сортировка по полю "created_at" по убыванию и по полю "id" по
    возрастанию, при этом такой запрос не должен возвращать soft удаленных пользователей.*/
    await queryRunner.query(
      `CREATE INDEX "IDX_users_created_at_id_active" ON "users" ("created_at" DESC, "id" ASC) WHERE "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_users_created_at_id_active"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_original_email_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_login_trgm"`);
  }
}
