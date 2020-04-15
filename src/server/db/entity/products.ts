import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn} from "typeorm";
import {ProductIngredient} from "./productIngredients";
import {DosageForm} from "./dosageForms";
import {Applicant} from "./applicants";
import {Route} from "./routes";
import {Type} from "class-transformer";

export enum ApplTypes { ORIGINAL = "ORIGINAL", GENERIC = "GENERIC"}

export enum AccessTypes { RX = "RX", OTC = "OTC", DISCN = "DISCN"}

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tradeName: string;

    @Column({type: "int",  nullable: true})
    dosageFormId: number;

    @Column({type: "int",  nullable: true})
    routeId: number;

    @Column({type: "varchar", length: 20, nullable: true})
    applicantShortName: string;

    @Column({type: "enum", enum: ApplTypes})
    applType: ApplTypes;

    @Column("int")
    applNo: number;

    @Column("smallint")
    productNo: number;

    @Column({type: "varchar", length: 20})
    teCode: string;

    @Type(() => Date)
    @Column("date")
    approvalDate: Date;

    @Column("boolean")
    rld: boolean;

    @Column("boolean")
    rs: boolean;

    @Column({type: "enum", enum: AccessTypes})
    accessType: AccessTypes;

    @OneToMany(() => ProductIngredient, productIngredient => productIngredient.product)
    productIngredients: ProductIngredient[];

    @ManyToOne(() => DosageForm, dosageForm => dosageForm.products)
    dosageForm: DosageForm;

    @ManyToOne(() => Route, route => route.products)
    route: Route;

    @ManyToOne(() => Applicant, applicant => applicant.products)
    @JoinColumn({ name: "applicant_short_name" })
    applicant: Applicant;
}