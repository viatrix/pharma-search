import { ParseLineStream } from '../parseLineStream';
import { PassThrough } from 'stream';
import { ProductType } from '../saveToDbService';

describe('ParseLineStream', () => {
  it('should parse one line of data', async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'BUDESONIDE',
      'DF;Route': 'AEROSOL, FOAM;RECTAL',
      Trade_Name: 'UCERIS',
      Applicant: 'VALEANT PHARMS INTL',
      Strength: '2MG/ACTUATION',
      Appl_Type: 'N',
      Appl_No: '205613',
      Product_No: '001',
      TE_Code: '',
      Approval_Date: 'Oct 7, 2014',
      RLD: 'Yes',
      RS: 'Yes',
      Type: 'RX',
      Applicant_Full_Name: 'VALEANT PHARMACEUTICALS INTERNATIONAL'
    };
    await new Promise((resolve) => {
      outputStream.on('finish', () => {
        resolve();
      });
      inputStream.pipe(parseLineStream).pipe(outputStream);
      inputStream.write(testData);
      inputStream.end();
    });
    expect(outObj.length).toEqual(1);
    expect(outObj[0]).toMatchSnapshot();
  });

  it('should parse a line with complex ingredients', async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'PANCRELIPASE (AMYLASE;LIPASE;PROTEASE)',
      'DF;Route': 'CAPSULE, DELAYED RELEASE;ORAL',
      Trade_Name: 'CREON',
      Applicant: 'ABBVIE',
      Strength: '60,000USP UNITS;12,000USP UNITS;38,000USP UNITS',
      Appl_Type: 'N',
      Appl_No: '020725',
      Product_No: '002',
      TE_Code: '',
      Approval_Date: 'Apr 30, 2009',
      RLD: 'Yes',
      RS: 'No',
      Type: 'RX',
      Applicant_Full_Name: 'ABBVIE INC'
    };
    await new Promise((resolve) => {
      outputStream.on('finish', () => {
        resolve();
      });
      inputStream.pipe(parseLineStream).pipe(outputStream);
      inputStream.write(testData);
      inputStream.end();
    });
    expect(outObj.length).toEqual(1);
    expect(outObj[0]).toMatchSnapshot();
  });

  it('should parse a line with braces in single ingredient', async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'FERRIC HEXACYANOFERRATE(II)',
      'DF;Route': 'CAPSULE;ORAL',
      Trade_Name: 'RADIOGARDASE (PRUSSIAN BLUE)',
      Applicant: 'HEYL CHEMISCH',
      Strength: '500MG',
      Appl_Type: 'N',
      Appl_No: '021626',
      Product_No: '001',
      TE_Code: '',
      Approval_Date: 'Oct 2, 2003',
      RLD: 'Yes',
      RS: 'Yes',
      Type: 'RX',
      Applicant_Full_Name: 'HEYL CHEMISCH PHARMAZEUTISHE FABRIK'
    };
    await new Promise((resolve) => {
      outputStream.on('finish', () => {
        resolve();
      });
      inputStream.pipe(parseLineStream).pipe(outputStream);
      inputStream.write(testData);
      inputStream.end();
    });
    expect(outObj.length).toEqual(1);
    expect(outObj[0]).toMatchSnapshot();
  });

  it('should parse a line with complex strength', async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'ARTICAINE HYDROCHLORIDE; EPINEPHRINE BITARTRATE',
      'DF;Route': 'INJECTABLE;INJECTION',
      Trade_Name: 'ARTICAINE HYDROCHLORIDE AND EPINEPHRINE BITARTRATE',
      Applicant: 'HOSPIRA',
      Strength: '4%;EQ 0.017MG BASE/1.7ML (4%;EQ 0.01MG BASE/ML)',
      Appl_Type: 'A',
      Appl_No: '079138',
      Product_No: '001',
      TE_Code: '',
      Approval_Date: 'Oct 2, 2003',
      RLD: 'No',
      RS: 'No',
      Type: 'DISCN',
      Applicant_Full_Name: 'HOSPIRA INC'
    };
    await new Promise((resolve) => {
      outputStream.on('finish', () => {
        resolve();
      });
      inputStream.pipe(parseLineStream).pipe(outputStream);
      inputStream.write(testData);
      inputStream.end();
    });
    expect(outObj.length).toEqual(1);
    expect(outObj[0]).toMatchSnapshot();
  });

  it('should parse a line with complex strength with brackets', async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'OLIVE OIL; SOYBEAN OIL',
      'DF;Route': 'EMULSION;INTRAVENOUS',
      Trade_Name: 'CLINOLIPID 20%',
      Applicant: 'BAXTER HLTHCARE CORP',
      Strength: '16%(160GM/1000ML);4%  (40GM/1000ML)',
      Appl_Type: 'N',
      Appl_No: '204508',
      Product_No: '001',
      TE_Code: '',
      Approval_Date: 'Oct 3, 2013',
      RLD: 'Yes',
      RS: 'Yes',
      Type: 'RX',
      Applicant_Full_Name: 'HOSPIRA INC'
    };
    await new Promise((resolve) => {
      outputStream.on('finish', () => {
        resolve();
      });
      inputStream.pipe(parseLineStream).pipe(outputStream);
      inputStream.write(testData);
      inputStream.end();
    });
    expect(outObj.length).toEqual(1);
    expect(outObj[0]).toMatchSnapshot();
  });

  it('should remove federal note from strength', async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'TRAZODONE HYDROCHLORIDEL',
      'DF;Route': 'TABLET, EXTENDED RELEASE;ORAL',
      Trade_Name: 'OLEPTRO',
      Applicant: 'ANGELINI PHARMA',
      Strength:
        '150MG **Federal Register determination that product was not discontinued or withdrawn for safety or efficacy reasons**',
      Appl_Type: 'N',
      Appl_No: '022411',
      Product_No: '001',
      TE_Code: '',
      Approval_Date: 'Feb 2, 2010',
      RLD: 'Yes',
      RS: 'No',
      Type: 'DISCN',
      Applicant_Full_Name: 'ANGELINI PHARMA INC'
    };
    await new Promise((resolve) => {
      outputStream.on('finish', () => {
        resolve();
      });
      inputStream.pipe(parseLineStream).pipe(outputStream);
      inputStream.write(testData);
      inputStream.end();
    });
    expect(outObj.length).toEqual(1);
    expect(outObj[0]).toMatchSnapshot();
  });

  it("should NOT parse file if appl_type is not 'N' or 'A'", async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'BUDESONIDE',
      'DF;Route': 'AEROSOL, FOAM;RECTAL',
      Trade_Name: 'UCERIS',
      Applicant: 'VALEANT PHARMS INTL',
      Strength: '2MG/ACTUATION',
      Appl_Type: 'wrong_appl_type',
      Appl_No: '205613',
      Product_No: '001',
      TE_Code: '',
      Approval_Date: 'Oct 7, 2014',
      RLD: 'Yes',
      RS: 'Yes',
      Type: 'RX',
      Applicant_Full_Name: 'VALEANT PHARMACEUTICALS INTERNATIONAL'
    };
    try {
      await new Promise((resolve) => {
        outputStream.on('finish', () => {
          resolve();
        });
        inputStream.pipe(parseLineStream).pipe(outputStream);
        inputStream.write(testData);
        inputStream.end();
      });
    } catch (err) {
      expect(err.message).toEqual('Invalid appl_type wrong_appl_type');
    }
  });

  it('should NOT parse file if access type is not valid', async () => {
    const parseLineStream = new ParseLineStream();
    const inputStream = new PassThrough({ objectMode: true });
    const outputStream = new PassThrough({ objectMode: true });
    const outObj: Array<ProductType> = [];
    outputStream._write = (chunk, _encoding, callback) => {
      outObj.push(chunk);
      callback();
    };
    const testData = {
      Ingredient: 'BUDESONIDE',
      'DF;Route': 'AEROSOL, FOAM;RECTAL',
      Trade_Name: 'UCERIS',
      Applicant: 'VALEANT PHARMS INTL',
      Strength: '2MG/ACTUATION',
      Appl_Type: 'N',
      Appl_No: '205613',
      Product_No: '001',
      TE_Code: '',
      Approval_Date: 'Oct 7, 2014',
      RLD: 'Yes',
      RS: 'Yes',
      Type: 'wrong_access_type',
      Applicant_Full_Name: 'VALEANT PHARMACEUTICALS INTERNATIONAL'
    };
    try {
      await new Promise((resolve) => {
        outputStream.on('finish', () => {
          resolve();
        });
        inputStream.pipe(parseLineStream).pipe(outputStream);
        inputStream.write(testData);
        inputStream.end();
      });
    } catch (err) {
      expect(err.message).toEqual('Invalid access_type wrong_access_type');
    }
  });
});
