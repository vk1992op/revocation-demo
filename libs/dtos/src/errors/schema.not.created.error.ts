import { OcmError } from "./ocm.error";

export class SchemaNotCreatedError extends OcmError {
  constructor(message = "Failed to create schema") {
    super(message);
    this.name = "SchemaNotCreatedError";

    if (OcmError.captureStackTrace) {
      OcmError.captureStackTrace(this, SchemaNotCreatedError);
    }
  }
}
