import {AccessTypes, ApplTypes} from "../db/entity/products";
import {Transform, TransformCallback} from "stream";

export type FileProductType = {
  Ingredient: string,
  'DF;Route': string,
  Trade_Name: string,
  Applicant: string,
  Strength: string,
  Appl_Type: string,
  Appl_No: string,
  Product_No: string,
  TE_Code: string,
  Approval_Date: string,
  RLD: string,
  RS: string,
  Type: string,
  Applicant_Full_Name: string
}

export type ProductType = {
  ingredients: string[]
  dosageForm: string
  route: string
  tradeName: string
  applicant: string
  strength: string[]
  applType: ApplTypes
  applNo: number
  productNo: number
  teCode: string
  approvalDate: Date
  rld: boolean
  rs: boolean
  accessType: AccessTypes
  applicantFullName: string
}

export class ParseLineStream extends Transform {

  constructor() {
    super({objectMode: true});
  }

  public _transform(chunk: FileProductType, _encoding: string, callback: TransformCallback) {
    try {
      this.push(this.parseLine(chunk));
    }
    catch(error) {
      if (error.name !== 'InconsistentIngredientsStrength') {
        throw(error);
      }
    }
    callback();
  }

  private parseLine (line: FileProductType): ProductType {
    const FEDERAL_NOTE =
      ' **Federal Register determination that product was not discontinued or withdrawn for safety or efficacy reasons**';
    if (line.Strength.includes(FEDERAL_NOTE)) {
      line.Strength = line.Strength.slice(0, line.Strength.indexOf(FEDERAL_NOTE));
    }

    // Ingredients for each product are represented as a list separated by semicolon
    // Strength is specified for each ingredient
    // Lists of strength and ingredient have equal length
    // Strength and ingredients can have additional brackets, semicolons etc that require processing
    let ingredients: string[];
    if (line.Ingredient.includes(' (')) {
      const basicIngredients = line.Ingredient.slice(
          line.Ingredient.indexOf(' (') + 2,
          line.Ingredient.indexOf(')')
      );
      ingredients = basicIngredients.split(';');
    } else {
      ingredients = line.Ingredient.split('; ');
    }
    let strength = line.Strength.split(';');
    let balanced = true;
    for (let i = 0; i < strength.length; i++) {
      if (!this.bracketsBalanced(strength[i])) {
        balanced = false;
      }
    }
    let rawStrength = line.Strength;
    if (!balanced) {
      rawStrength = rawStrength.slice(
        rawStrength.indexOf(' (') + 2,
        rawStrength.indexOf(')')
      );
      strength = rawStrength.split(';');
    }
    if (strength.length !== ingredients.length) {
      const err = new Error(
        `Incorrect list of ingredients and strength for ${line.Trade_Name}`
      );
      err.name = 'InconsistentIngredientsStrength';
      throw err;
    }

    // Dosage form and route are specified as one field in csv separated by semicolon
    const dosageForm = line['DF;Route'].slice(0, line['DF;Route'].indexOf(';'));
    const route = line['DF;Route'].slice(line['DF;Route'].indexOf(';') + 1);

    // Application type and access type should be converted to enum
    let applType: ApplTypes;
    switch (line.Appl_Type) {
      case 'N':
        applType = ApplTypes.ORIGINAL;
        break;
      case 'A':
        applType = ApplTypes.GENERIC;
        break;
      default:
        throw new Error(`Invalid appl_type ${line.Appl_Type}`);
    }
    let accessType: AccessTypes;
    switch (line.Type) {
      case 'RX':
        accessType = AccessTypes.RX;
        break;
      case 'OTC':
        accessType = AccessTypes.OTC;
        break;
      case 'DISCN':
        accessType = AccessTypes.DISCN;
        break;
      default:
        throw new Error(`Invalid access_type ${line.Type}`);
    }

    const applNo = +line.Appl_No;
    const productNo = +line.Product_No;

    const approvalDate = new Date(line.Approval_Date);

    const rld = line.RLD === 'Yes';
    const rs = line.RS === 'Yes';

    return {
      ingredients,
      dosageForm,
      route,
      tradeName: line.Trade_Name,
      applicant: line.Applicant,
      strength,
      applType,
      applNo,
      productNo,
      teCode: line.TE_Code,
      approvalDate,
      rld,
      rs,
      accessType,
      applicantFullName: line.Applicant_Full_Name
    };
  }

  private bracketsBalanced (line: string): boolean {
    let balanced = 0;
    for (let i = 0; i < line.length; i++) {
      switch (line[i]) {
        case '(':
          balanced += 1;
          break;
        case ')':
          balanced -= 1;
      }
    }
    return balanced === 0;
  }
}