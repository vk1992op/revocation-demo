import { OcmError } from "./ocm.error";

export class CredentialNotCreatedError extends OcmError {
  constructor(message = "Failed to create credential") {
    super(message);
    this.name = "CredentialNotCreatedError";

    if (OcmError.captureStackTrace) {
      OcmError.captureStackTrace(this, CredentialNotCreatedError);
    }
  }
}
