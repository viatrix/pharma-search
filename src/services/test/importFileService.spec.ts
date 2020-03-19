// import {validateEvent, parseFile} from "../importFileService";
// import {S3Event} from "aws-lambda";
//
// describe("ValidateEvent", () => {
//   it("should pass if there is 1 file in the event", () => {
//     const testEvent: S3Event = {
//       Records: [S3EventRecord]
//     };
//     expect(validateEvent(testEvent)).toBe(true);
//   });
//
//   it("should NOT pass if no files are in the event", () => {
//     const testEvent: S3Event = {
//       Records: []
//     };
//     expect(validateEvent(testEvent)).toBe(false);
//   });
//
//   it("should NOT pass if no files are in the event", () => {
//     const testEvent: S3Event = {
//       Records: [S3EventRecord, S3EventRecord]
//     };
//     expect(validateEvent(testEvent)).toBe(false);
//   });
// });
//
// describe("ParseFile", () => {
//   it("should pass if there is 1 file in the event", async () => {
//     const testData = "Ingredient~DF;Route~Trade_Name~Applicant~Strength~Appl_Type~Appl_No~Product_No~TE_Code~Approval_Date~RLD~RS~Type~Applicant_Full_Name\n" +
//         "BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~N~205613~001~~Oct 7, 2014~Yes~Yes~RX~VALEANT PHARMACEUTICALS INTERNATIONAL\n" +
//         "MINOCYCLINE HYDROCHLORIDE~AEROSOL, FOAM;TOPICAL~AMZEEQ~FOAMIX~EQ 4% BASE~N~212379~001~~Oct 18, 2019~Yes~Yes~RX~FOAMIX PHARMACEUTICALS INC\n" +
//         "BETAMETHASONE VALERATE~AEROSOL, FOAM;TOPICAL~BETAMETHASONE VALERATE~PERRIGO UK FINCO~0.12%~A~078337~001~AB~Nov 26, 2012~No~No~RX~PERRIGO UK FINCO LTD PARTNERSHIP\n" +
//         "BETAMETHASONE VALERATE~AEROSOL, FOAM;TOPICAL~BETAMETHASONE VALERATE~RICONPHARMA LLC~0.12%~A~207144~001~AB~May 24, 2017~No~No~RX~RICONPHARMA LLC\n" +
//         "BETAMETHASONE VALERATE~AEROSOL, FOAM;TOPICAL~BETAMETHASONE VALERATE~TARO~0.12%~A~208204~001~AB~May 24, 2017~No~No~RX~TARO PHARMACEUTICAL INDUSTRIES LTD\n" +
//         "CLINDAMYCIN PHOSPHATE~AEROSOL, FOAM;TOPICAL~CLINDAMYCIN PHOSPHATE~PERRIGO UK FINCO~1%~A~090785~001~AT~Mar 31, 2010~No~No~RX~PERRIGO UK FINCO LTD PARTNERSHIP\n" +
//         "CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~GLENMARK PHARMS LTD~0.05%~A~210809~001~AB1~Feb 15, 2019~No~No~RX~GLENMARK PHARMACEUTICALS LTD\n" +
//         "CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~GLENMARK PHARMS LTD~0.05%~A~211450~001~AB2~Sep 9, 2019~No~No~RX~GLENMARK PHARMACEUTICALS LTD\n" +
//         "CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~INGENUS PHARMS LLC~0.05%~A~206805~001~AB1~Jul 31, 2017~No~No~RX~INGENUS PHARMACEUTICALS LLC\n" +
//         "CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~PERRIGO ISRAEL~0.05%~A~077763~001~AB1~Mar 10, 2008~No~No~RX~PERRIGO ISRAEL PHARMACEUTICALS LTD\n" +
//         "CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~PERRIGO UK FINCO~0.05%~A~201402~001~AB2~Aug 14, 2012~No~No~RX~PERRIGO UK FINCO LTD PARTNERSHIP\n" +
//         "CLOBETASOL PROPIONATE~AEROSOL, FOAM;TOPICAL~CLOBETASOL PROPIONATE~TARO~0.05%~A~208779~001~AB1~Oct 4, 2018~No~No~RX~TARO PHARMACEUTICAL INDUSTRIES LTD\n" +
//         "ECONAZOLE NITRATE~AEROSOL, FOAM;TOPICAL~ECOZA~GLENMARK~1%~N~205175~001~~Oct 24, 2013~Yes~Yes~RX~GLENMARK THERAPEUTICS INC USA\n" +
//         "BETAMETHASONE DIPROPIONATE; CALCIPOTRIENE~AEROSOL, FOAM;TOPICAL~ENSTILAR~LEO PHARMA AS~0.064%;0.005%~N~207589~001~~Oct 16, 2015~Yes~Yes~RX~LEO PHARMA AS\n" +
//         "CLINDAMYCIN PHOSPHATE~AEROSOL, FOAM;TOPICAL~EVOCLIN~MYLAN~1%~N~050801~001~AT~Oct 22, 2004~Yes~Yes~RX~MYLAN PHARMACEUTICALS INC";
//     await parseFile(testData);
//   });
//
//   it("should NOT parse file if number of columns is less than 14", async () => {
//     const testData = "string without columns";
//     try {
//       await parseFile(testData);
//     } catch(err) {
//       expect(err.message).toEqual("File doesn't contain 14 columns separated by ~");
//     }
//   });
//
//   it("should NOT parse file if number of columns is more than 14", async () => {
//     const testData = "col1~col2~col3~col4~col5~col6~col7~col8~col9~col10~col11~col12~col13~col14~col15";
//     try {
//       await parseFile(testData);
//     } catch(err) {
//       expect(err.message).toEqual("File doesn't contain 14 columns separated by ~");
//     }
//   });
//
//   it("should NOT parse file if appl_type is not 'N' or 'A'", async () => {
//     const testData = "Ingredient~DF;Route~Trade_Name~Applicant~Strength~Appl_Type~Appl_No~Product_No~TE_Code~Approval_Date~RLD~RS~Type~Applicant_Full_Name\n" +
//         "BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~wrong_appl_type~205613~001~~Oct 7, 2014~Yes~Yes~RX~VALEANT PHARMACEUTICALS INTERNATIONAL\n";
//     try {
//       await parseFile(testData);
//     } catch(err) {
//       expect(err.message).toEqual("Invalid appl_type wrong_appl_type");
//     }
//   });
//
//   it("should NOT parse file if access type is not valid", async () => {
//     const testData = "Ingredient~DF;Route~Trade_Name~Applicant~Strength~Appl_Type~Appl_No~Product_No~TE_Code~Approval_Date~RLD~RS~Type~Applicant_Full_Name\n" +
//         "BUDESONIDE~AEROSOL, FOAM;RECTAL~UCERIS~VALEANT PHARMS INTL~2MG/ACTUATION~N~205613~001~~Oct 7, 2014~Yes~Yes~wrong_access_type~VALEANT PHARMACEUTICALS INTERNATIONAL\n";
//     try {
//       await parseFile(testData);
//     } catch(err) {
//       expect(err.message).toEqual("Invalid access_type wrong_access_type");
//     }
//   });
// });