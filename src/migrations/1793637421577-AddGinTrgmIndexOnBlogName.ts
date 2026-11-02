import { MigrationInterface, QueryRunner } from 'typeorm';

/*Создаем миграцию для добавления в таблицу блогов GIN индекса на поле "name", используя расширение pg_trgm.*/
export class AddGinTrgmIndexOnBlogName1793637421577 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*Включаем расширение pg_trgm, если еще не включено.*/
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    /*Создаем GIN индекс на поле "name", который нужен при поиске блогов с оператором "ILIKE", поскольку B-Tree не может
    ускорять такой поиск по следующим причинам:
    1. Поиск идет не по началу строки
    2. Опция "collation 'C'" на поле "name" использует побайтовое сравнение, из-за чего B-Tree не может ускорить
    регистронезависимый поиск через "ILIKE", так как заглавные и строчные буквы лежат в разных местах индекса.*/
    await queryRunner.query(`CREATE INDEX "IDX_blogs_name_trgm" ON "blogs" USING GIN ("name" gin_trgm_ops);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blogs_name_trgm";`);
  }
}
