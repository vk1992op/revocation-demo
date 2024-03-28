import { CredentialState } from "@credo-ts/core";

export class CredentialFilterDto {
  public states?: Array<CredentialState>;

  public connectionId?: string;
}
