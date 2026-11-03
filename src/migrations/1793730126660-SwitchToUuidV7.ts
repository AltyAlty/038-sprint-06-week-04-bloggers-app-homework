import { MigrationInterface, QueryRunner } from 'typeorm';

/*Создаем миграцию для перехода PK с UUIDv4 на UUIDv7.*/
export class SwitchToUuidV71793730126660 implements MigrationInterface {
  name = 'SwitchToUuidV71793730126660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "email_confirmations" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "password_recovery_codes_data" ALTER COLUMN "id" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "email_confirmations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);

    await queryRunner.query(
      `ALTER TABLE "password_recovery_codes_data" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`
    );
  }
}
