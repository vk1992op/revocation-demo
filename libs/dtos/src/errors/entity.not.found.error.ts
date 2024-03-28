import { OcmError } from "./ocm.error";

export class EntityNotFoundError extends OcmError {
  constructor(message = "Entity not found") {
    super(message);
    this.name = "EntityNotFoundError";

    if (OcmError.captureStackTrace) {
      OcmError.captureStackTrace(this, EntityNotFoundError);
    }
  }
}
