import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1585842839526 implements MigrationInterface {
    name = 'InitialMigration1585842839526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ingredient" ("id" SERIAL NOT NULL, "ingredient" character varying(100) NOT NULL, CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "product_ingredient" ("id" SERIAL NOT NULL, "strength" character varying(150), "productId" integer, "ingredientId" integer, CONSTRAINT "PK_e7431906c21f94c0152d6b0db99" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "dosage_form" ("id" SERIAL NOT NULL, "dosageForm" character varying(100) NOT NULL, CONSTRAINT "PK_58f3a498d7cfa539e0d2fb7862f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "route" ("id" SERIAL NOT NULL, "route" character varying(100) NOT NULL, CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "tradeName" character varying NOT NULL, "dosageFormId" integer, "routeId" integer, "applicantShortName" character varying(20), "applType" "product_appltype_enum" NOT NULL, "applNo" integer NOT NULL, "productNo" smallint NOT NULL, "teCode" character varying(20) NOT NULL, "approvalDate" date NOT NULL, "rld" boolean NOT NULL, "rs" boolean NOT NULL, "accessType" "product_accesstype_enum" NOT NULL, "applicant_short_name" character varying(20), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "applicant" ("applicantShortName" character varying(20) NOT NULL, "applicantFullName" text NOT NULL, CONSTRAINT "PK_1acc486775fa39e7ce807c8db31" PRIMARY KEY ("applicantShortName"))`, undefined);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "product_ingredient" ADD CONSTRAINT "FK_1525d4cd30cd2af9de7952a0fe2" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_cc8806be6e10d88f084f49ce511" FOREIGN KEY ("dosageFormId") REFERENCES "dosage_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_0d93bcc583370481372b9e65115" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_c7da456c2711ef936c554cc8c44" FOREIGN KEY ("applicant_short_name") REFERENCES "applicant"("applicantShortName") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_c7da456c2711ef936c554cc8c44"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_0d93bcc583370481372b9e65115"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_cc8806be6e10d88f084f49ce511"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_1525d4cd30cd2af9de7952a0fe2"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_ingredient" DROP CONSTRAINT "FK_d6fd52ba735eee4514d0a9a92cc"`, undefined);
        await queryRunner.query(`DROP TABLE "applicant"`, undefined);
        await queryRunner.query(`DROP TABLE "product"`, undefined);
        await queryRunner.query(`DROP TABLE "route"`, undefined);
        await queryRunner.query(`DROP TABLE "dosage_form"`, undefined);
        await queryRunner.query(`DROP TABLE "product_ingredient"`, undefined);
        await queryRunner.query(`DROP TABLE "ingredient"`, undefined);
    }

}
