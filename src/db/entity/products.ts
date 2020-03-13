import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn} from "typeorm";
import {ProductIngredient} from "./product_ingredients";
import {DosageForm} from "./dosage_forms";
import {Applicant} from "./applicants";
import {Route} from "./routes";

export enum appl_types { ORIGINAL = "ORIGINAL", GENERIC = "GENERIC"}

export enum access_types { RX = "RX", OTC = "OTC", DISCN = "DISCN"}

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    trade_name: string;

    @Column({type: "int",  nullable: true})
    dosage_form_id: number;

    @Column({type: "int",  nullable: true})
    route_id: number;

    @Column({type: "varchar", length: 20, nullable: true})
    applicant_short_name: string;

    @Column({type: "enum", enum: appl_types})
    appl_type: appl_types;

    @Column("int")
    appl_no: number;

    @Column("smallint")
    product_no: number;

    @Column({type: "varchar", length: 20})
    te_code: string;

    @Column("date")
    approval_date: Date;

    @Column("boolean")
    rld: boolean;

    @Column("boolean")
    rs: boolean;

    @Column({type: "enum", enum: access_types})
    access_type: access_types;

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