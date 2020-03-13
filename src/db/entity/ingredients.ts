import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {ProductIngredient} from "./product_ingredients";

@Entity()
export class Ingredient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 100})
    ingredient: string;

    @OneToMany(() => ProductIngredient, productIngredient => productIngredient.ingredient)
    productIngredients: ProductIngredient[];
}