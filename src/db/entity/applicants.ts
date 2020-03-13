import {Entity, Column, PrimaryColumn, OneToMany} from "typeorm";
import {Product} from "./products";

@Entity()
export class Applicant {
    @PrimaryColumn({type: "varchar", length: 20})
    applicant_short_name: string;

    @Column("text")
    applicant_full_name: string;

    @OneToMany(() => Product, product => product.applicant)
    products: Product[];
}