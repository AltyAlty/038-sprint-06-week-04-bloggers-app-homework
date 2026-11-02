import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogAndPostLikeDataAndSecurityDevicesAndSessionIndexes1793650463424 implements MigrationInterface {
  name = 'AddBlogAndPostLikeDataAndSecurityDevicesAndSessionIndexes1793650463424';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_post_likes_data_post_id_added_at_newest_likes" ON "post_likes_data"  ("post_id", "added_at") WHERE "like_status" = 'Like' AND "deleted_at" IS NULL`
    );

    await queryRunner.query(`CREATE INDEX "IDX_security_devices_user_id" ON "security_devices"  ("user_id") `);

    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_user_id_device_id_iat" ON "sessions"  ("user_id", "device_id", "iat") `
    );

    await queryRunner.query(`CREATE INDEX "IDX_blogs_name" ON "blogs"  ("name") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_blogs_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_user_id_device_id_iat"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_security_devices_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_post_likes_data_post_id_added_at_newest_likes"`);
  }
}
