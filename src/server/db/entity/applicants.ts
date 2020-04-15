import {Entity, Column, PrimaryColumn, OneToMany} from "typeorm";
import {Product} from "./products";

@Entity()
export class Applicant {
    @PrimaryColumn({type: "varchar", length: 20})
    applicantShortName: string;

    @Column("text")
    applicantFullName: string;

    @OneToMany(() => Product, product => product.applicant)
    products: Product[];
}