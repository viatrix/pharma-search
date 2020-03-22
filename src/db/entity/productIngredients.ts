import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import {Product} from "./products";
import {Ingredient} from "./ingredients";

@Entity()
export class ProductIngredient {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, product => product.productIngredients)
    product: Product;

    @ManyToOne(() => Ingredient, ingredient => ingredient.productIngredients)
    ingredient: Ingredient;

    @Column({type: "varchar", length: 20, nullable: true})
    strength: string;
}