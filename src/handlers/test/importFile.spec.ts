import {validateEvent} from "../importFile";
import {S3Event} from "aws-lambda";
import * as S3EventRecord from "./mock/S3EventRecord.json";

describe("ValidateEvent", () => {
  it("should pass if there is 1 file in the event", () => {
    const testEvent: S3Event = {
      Records: [S3EventRecord]
    };
    expect(validateEvent(testEvent)).toBe(true);
  });

  it("should NOT pass if no files are in the event", () => {
    const testEvent: S3Event = {
      Records: []
    };
    expect(validateEvent(testEvent)).toBe(false);
  });

  it("should NOT pass if no files are in the event", () => {
    const testEvent: S3Event = {
      Records: [S3EventRecord, S3EventRecord]
    };
    expect(validateEvent(testEvent)).toBe(false);
  });
});