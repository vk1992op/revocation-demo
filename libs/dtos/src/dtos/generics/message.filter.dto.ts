import { BasicMessageRole } from "@credo-ts/core";

export class MessageFilterDto {
  public role?: BasicMessageRole;

  public connectionId?: string;
}
