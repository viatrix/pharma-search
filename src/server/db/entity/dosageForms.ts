import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {Product} from "./products";

@Entity()
export class DosageForm {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 100})
    dosageForm: string;

    @OneToMany(() => Product, product => product.dosageForm)
    products: Product[];
}