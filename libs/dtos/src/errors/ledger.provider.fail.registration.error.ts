import { OcmError } from "./ocm.error";

export class LedgerProviderFailRegistrationError extends OcmError {
  constructor(message = "Provider failed to register did to ledger") {
    super(message);
    this.name = "LedgerProviderFailRegistrationError";

    if (OcmError.captureStackTrace) {
      OcmError.captureStackTrace(this, LedgerProviderFailRegistrationError);
    }
  }
}
