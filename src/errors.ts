import { SlipOkErrorMeta } from "./types";

export class SlipOkError extends Error {
  meta?: SlipOkErrorMeta;
  constructor(message: string, meta?: SlipOkErrorMeta) {
    super(message);
    this.name = "SlipOkError";
    this.meta = meta;
  }
}
