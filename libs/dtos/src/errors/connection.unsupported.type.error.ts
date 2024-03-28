import { OcmError } from "./ocm.error";

export class ConnectionUnsupportedTypeError extends OcmError {
  constructor(message = "Unsupported connection event type") {
    super(message);
    this.name = "ConnectionUnsupportedTypeError";

    if (OcmError.captureStackTrace) {
      OcmError.captureStackTrace(this, ConnectionUnsupportedTypeError);
    }
  }
}
