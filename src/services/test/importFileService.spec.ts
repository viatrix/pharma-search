import { ImportFileService } from '../importFileService';

let importFileService: ImportFileService;

describe('ParseFile', () => {
  beforeAll(() => {
    importFileService = new ImportFileService();
    importFileService.saveToDb = jest.fn();
  });

  it('should parse file with a header and one line of data', async () => {
    importFileService.parseLine = jest.fn();
    const testData =
      'Ingredient~DF;Route~Trade_Name~Applicant~Strength~Appl_Type~Appl_No~Product_No~TE_Code~Approval_Date~RLD~RS~Type~Applicant_Full_Name\n' +
      'BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~N~205613~001~~Oct 7, 2014~Yes~Yes~RX~VALEANT PHARMACEUTICALS INTERNATIONAL';
    await importFileService.parseFile(testData);
    expect(importFileService.parseLine).toHaveBeenCalledTimes(1);
    expect(importFileService.parseLine).toBeCalledWith(
      'BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~N~205613~001~~Oct 7, 2014~Yes~Yes~RX~VALEANT PHARMACEUTICALS INTERNATIONAL'
    );
  });

  it('should parse all lines of a file', async () => {
    importFileService.parseLine = jest.fn();
    const testData =
      'Ingredient~DF;Route~Trade_Name~Applicant~Strength~Appl_Type~Appl_No~Product_No~TE_Code~Approval_Date~RLD~RS~Type~Applicant_Full_Name\n' +
      'BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~N~205613~001~~Oct 7, 2014~Yes~Yes~RX~VALEANT PHARMACEUTICALS INTERNATIONAL\n' +
      'MINOCYCLINE HYDROCHLORIDE~AEROSOL, FOAM;TOPICAL~AMZEEQ~FOAMIX~EQ 4% BASE~N~212379~001~~Oct 18, 2019~Yes~Yes~RX~FOAMIX PHARMACEUTICALS INC\n' +
      'BETAMETHASONE VALERATE~AEROSOL, FOAM;TOPICAL~BETAMETHASONE VALERATE~PERRIGO UK FINCO~0.12%~A~078337~001~AB~Nov 26, 2012~No~No~RX~PERRIGO UK FINCO LTD PARTNERSHIP\n' +
      'BETAMETHASONE VALERATE~AEROSOL, FOAM;TOPICAL~BETAMETHASONE VALERATE~RICONPHARMA LLC~0.12%~A~207144~001~AB~May 24, 2017~No~No~RX~RICONPHARMA LLC\n' +
      'BETAMETHASONE VALERATE~AEROSOL, FOAM;TOPICAL~BETAMETHASONE VALERATE~TARO~0.12%~A~208204~001~AB~May 24, 2017~No~No~RX~TARO PHARMACEUTICAL INDUSTRIES LTD\n' +
      'CLINDAMYCIN PHOSPHATE~AEROSOL, FOAM;TOPICAL~CLINDAMYCIN PHOSPHATE~PERRIGO UK FINCO~1%~A~090785~001~AT~Mar 31, 2010~No~No~RX~PERRIGO UK FINCO LTD PARTNERSHIP\n' +
      'CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~GLENMARK PHARMS LTD~0.05%~A~210809~001~AB1~Feb 15, 2019~No~No~RX~GLENMARK PHARMACEUTICALS LTD\n' +
      'CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~GLENMARK PHARMS LTD~0.05%~A~211450~001~AB2~Sep 9, 2019~No~No~RX~GLENMARK PHARMACEUTICALS LTD\n' +
      'CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~INGENUS PHARMS LLC~0.05%~A~206805~001~AB1~Jul 31, 2017~No~No~RX~INGENUS PHARMACEUTICALS LLC\n' +
      'CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~PERRIGO ISRAEL~0.05%~A~077763~001~AB1~Mar 10, 2008~No~No~RX~PERRIGO ISRAEL PHARMACEUTICALS LTD\n' +
      'CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~PERRIGO UK FINCO~0.05%~A~201402~001~AB2~Aug 14, 2012~No~No~RX~PERRIGO UK FINCO LTD PARTNERSHIP\n' +
      'CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~TARO~0.05%~A~208779~001~AB1~Oct 4, 2018~No~No~RX~TARO PHARMACEUTICAL INDUSTRIES LTD\n' +
      'ECONAZOLE NITRATE~AEROSOL, FOAM;TOPICAL~ECOZA~GLENMARK~1%~N~205175~001~~Oct 24, 2013~Yes~Yes~RX~GLENMARK THERAPEUTICS INC USA\n' +
      'BETAMETHASONE DIPROPIONATE; CALCIPOTRIENE~AEROSOL, FOAM;TOPICAL~ENSTILAR~LEO PHARMA AS~0.064%;0.005%~N~207589~001~~Oct 16, 2015~Yes~Yes~RX~LEO PHARMA AS\n' +
      'CLINDAMYCIN PHOSPHATE~AEROSOL, FOAM;TOPICAL~EVOCLIN~MYLAN~1%~N~050801~001~AT~Oct 22, 2004~Yes~Yes~RX~MYLAN PHARMACEUTICALS INC';
    await importFileService.parseFile(testData);
    expect(importFileService.parseLine).toHaveBeenCalledTimes(15);
  });
});

describe('ParseLine', () => {
  beforeAll(() => {
    importFileService = new ImportFileService();
  });

  it('should parse a line of data', async () => {
    const testLine =
      'BETAMETHASONE DIPROPIONATE; CALCIPOTRIENE~AEROSOL, FOAM;TOPICAL~ENSTILAR~LEO PHARMA AS~0.064%;0.005%~N~207589~001~~Oct 16, 2015~Yes~Yes~RX~LEO PHARMA AS';
    const product = await importFileService.parseLine(testLine);
    expect(product).toMatchSnapshot();
  });

  it('should parse a line with complex ingredients', async () => {
    const testLine =
      'PANCRELIPASE (AMYLASE;LIPASE;PROTEASE)~CAPSULE, DELAYED RELEASE;ORAL~CREON~ABBVIE~60,000USP UNITS;12,000USP UNITS;38,000USP UNITS~N~020725~002~~Apr 30, 2009~Yes~No~RX~ABBVIE INC';
    const product = await importFileService.parseLine(testLine);
    expect(product).toMatchSnapshot();
  });

  it('should parse a line with braces in single ingredient', async () => {
    const testLine =
      'FERRIC HEXACYANOFERRATE(II)~CAPSULE;ORAL~RADIOGARDASE (PRUSSIAN BLUE)~HEYL CHEMISCH~500MG~N~021626~001~~Oct 2, 2003~Yes~Yes~RX~HEYL CHEMISCH PHARMAZEUTISHE FABRIK';
    const product = await importFileService.parseLine(testLine);
    expect(product).toMatchSnapshot();
  });

  it('should parse a line with complex strength', async () => {
    const testLine =
      'ARTICAINE HYDROCHLORIDE; EPINEPHRINE BITARTRATE~INJECTABLE;INJECTION~ARTICAINE HYDROCHLORIDE AND EPINEPHRINE BITARTRATE~HOSPIRA~4%;EQ 0.017MG BASE/1.7ML (4%;EQ 0.01MG BASE/ML)~A~079138~001~~Jun 18, 2010~No~No~DISCN~HOSPIRA INC';
    const product = await importFileService.parseLine(testLine);
    expect(product).toMatchSnapshot();
  });

  it('should parse a line with complex strength with brackets', async () => {
    const testLine =
      'OLIVE OIL; SOYBEAN OIL~EMULSION;INTRAVENOUS~CLINOLIPID 20%~BAXTER HLTHCARE CORP~16%(160GM/1000ML);4%  (40GM/1000ML)~N~204508~001~~Oct 3, 2013~Yes~Yes~RX~BAXTER HEALTHCARE CORP';
    const product = await importFileService.parseLine(testLine);
    expect(product).toMatchSnapshot();
  });

  it('should remove federal note from strength', async () => {
    const testLine =
      'TRAZODONE HYDROCHLORIDE~TABLET, EXTENDED RELEASE;ORAL~OLEPTRO~ANGELINI PHARMA~150MG **Federal Register determination that product was not discontinued or withdrawn for safety or efficacy reasons**~N~022411~001~~Feb 2, 2010~Yes~No~DISCN~ANGELINI PHARMA INC';
    const product = await importFileService.parseLine(testLine);
    expect(product).toMatchSnapshot();
  });

  it('should NOT parse a line of data if number of columns is less than 14', async () => {
    const testLine = 'test string';
    try {
      await importFileService.parseLine(testLine);
    } catch (err) {
      expect(err.message).toEqual(
        "Line doesn't contain 14 columns separated by ~: test string"
      );
    }
  });

  it('should NOT parse file if number of columns is more than 14', async () => {
    const testLine =
      'col1~col2~col3~col4~col5~col6~col7~col8~col9~col10~col11~col12~col13~col14~col15';
    try {
      await importFileService.parseLine(testLine);
    } catch (err) {
      expect(err.message).toEqual(
        "Line doesn't contain 14 columns separated by ~: col1~col2~col3~col4~col5~col6~col7~col8~col9~col10~col11~col12~col13~col14~col15"
      );
    }
  });

  it("should NOT parse file if appl_type is not 'N' or 'A'", async () => {
    const testLine =
      'BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~wrong_appl_type~205613~001~~Oct 7, 2014~Yes~Yes~RX~VALEANT PHARMACEUTICALS INTERNATIONAL\n';
    try {
      await importFileService.parseLine(testLine);
    } catch (err) {
      expect(err.message).toEqual('Invalid appl_type wrong_appl_type');
    }
  });

  it('should NOT parse file if access type is not valid', async () => {
    const testLine =
      'BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~N~205613~001~~Oct 7, 2014~Yes~Yes~wrong_access_type~VALEANT PHARMACEUTICALS INTERNATIONAL\n';
    try {
      await importFileService.parseLine(testLine);
    } catch (err) {
      expect(err.message).toEqual('Invalid access_type wrong_access_type');
    }
  });
});
