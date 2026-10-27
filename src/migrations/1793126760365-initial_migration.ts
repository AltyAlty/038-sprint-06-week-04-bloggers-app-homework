import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1793126760365 implements MigrationInterface {
  name = 'InitialMigration1793126760365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "post_likes_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blog_id" uuid NOT NULL, "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "like_status" character varying(7) NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_post_user" UNIQUE ("post_id", "user_id"), CONSTRAINT "CHK_a4764ad50fde3318ec7be48151" CHECK ("like_status" IN ('Like', 'Dislike')), CONSTRAINT "PK_bb7036a4bfffa91fecc06df7d8f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blog_id" uuid NOT NULL, "title" character varying(30) COLLATE "C" NOT NULL, "short_description" character varying(100) COLLATE "C" NOT NULL, "content" character varying(1000) COLLATE "C" NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "dislikes_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "CHK_640787903dcef91d734c35cf1e" CHECK ("dislikes_count" >= 0), CONSTRAINT "CHK_f2b02f9f4039785a215ecf93cf" CHECK ("likes_count" >= 0), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "comment_likes_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blog_id" uuid NOT NULL, "post_id" uuid NOT NULL, "comment_id" uuid NOT NULL, "user_id" uuid NOT NULL, "like_status" character varying(7) NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_comment_user" UNIQUE ("comment_id", "user_id"), CONSTRAINT "CHK_31ff9bd8fcda4d6836e03f3502" CHECK ("like_status" IN ('Like', 'Dislike')), CONSTRAINT "PK_878266ab98beb14dbdf7a729a98" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "email_confirmations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "confirmation_code" character varying(100) NOT NULL, "expiration_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_178b5599cd7e3ec9cfdfb144b50" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "password_recovery_codes_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "password_recovery_code" character varying(100) NOT NULL, "expiration_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_19edde3fff2e5542f205f3fb052" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "security_devices" ("device_id" uuid NOT NULL, "user_id" uuid NOT NULL, "title" character varying(1000) NOT NULL, "ip" character varying(100) NOT NULL, "last_active_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b71a3a02510d7a9bc8d15df7991" PRIMARY KEY ("device_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "device_id" uuid NOT NULL, "iat" TIMESTAMP NOT NULL, "exp" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying(10) COLLATE "C" NOT NULL, "original_email" character varying(1000) NOT NULL, "email" character varying(1000) COLLATE "C" NOT NULL, "password_hash" character varying(1000) NOT NULL, "is_confirmed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blog_id" uuid NOT NULL, "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "content" character varying(300) COLLATE "C" NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "dislikes_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "CHK_8ea57588674d166418f4a7b881" CHECK ("dislikes_count" >= 0), CONSTRAINT "CHK_b0d19264437f65d2501f41df59" CHECK ("likes_count" >= 0), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "blogs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(15) COLLATE "C" NOT NULL, "description" character varying(500) COLLATE "C" NOT NULL, "website_url" character varying(100) COLLATE "C" NOT NULL, "is_membership" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes_data" ADD CONSTRAINT "FK_16227d32751879d37911440f9e8" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes_data" ADD CONSTRAINT "FK_1f1c6cc6a17b850cf5fde288550" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes_data" ADD CONSTRAINT "FK_f65af138ef339a254910a5a5cc7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_7689491fe4377a8090576a799a0" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_6a991e7be7485d716d54dbd7eae" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_1c195d87ddb2dbc852fe2d866cf" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_8f123118146e1dbf705c1befe80" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes_data" ADD CONSTRAINT "FK_a9fc9c68d9d47a6003c79903a0b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "email_confirmations" ADD CONSTRAINT "FK_97c4781eabb13c92ea53f21d8f9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "password_recovery_codes_data" ADD CONSTRAINT "FK_a9b75fc088dd1872439f430f05d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "security_devices" ADD CONSTRAINT "FK_6143ad1ef6f122d933239d3b050" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_97207844c19e5c27d33a07f67c0" FOREIGN KEY ("device_id") REFERENCES "security_devices"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_6754bf738cb68004be154e1d1d5" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_6754bf738cb68004be154e1d1d5"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_97207844c19e5c27d33a07f67c0"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
    await queryRunner.query(`ALTER TABLE "security_devices" DROP CONSTRAINT "FK_6143ad1ef6f122d933239d3b050"`);
    await queryRunner.query(
      `ALTER TABLE "password_recovery_codes_data" DROP CONSTRAINT "FK_a9b75fc088dd1872439f430f05d"`
    );
    await queryRunner.query(`ALTER TABLE "email_confirmations" DROP CONSTRAINT "FK_97c4781eabb13c92ea53f21d8f9"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_a9fc9c68d9d47a6003c79903a0b"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_8f123118146e1dbf705c1befe80"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_1c195d87ddb2dbc852fe2d866cf"`);
    await queryRunner.query(`ALTER TABLE "comment_likes_data" DROP CONSTRAINT "FK_6a991e7be7485d716d54dbd7eae"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_7689491fe4377a8090576a799a0"`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" DROP CONSTRAINT "FK_f65af138ef339a254910a5a5cc7"`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" DROP CONSTRAINT "FK_1f1c6cc6a17b850cf5fde288550"`);
    await queryRunner.query(`ALTER TABLE "post_likes_data" DROP CONSTRAINT "FK_16227d32751879d37911440f9e8"`);
    await queryRunner.query(`DROP TABLE "blogs"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "security_devices"`);
    await queryRunner.query(`DROP TABLE "password_recovery_codes_data"`);
    await queryRunner.query(`DROP TABLE "email_confirmations"`);
    await queryRunner.query(`DROP TABLE "comment_likes_data"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "post_likes_data"`);
  }
}
