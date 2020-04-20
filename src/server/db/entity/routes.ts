import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {Product} from "./products";

@Entity()
export class Route {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 100})
    route: string;

    @OneToMany(() => Product, product => product.route)
    products: Product[];
}