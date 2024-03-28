import { ProofState } from "@credo-ts/core";

export class ProofFilterDto {
  public states?: Array<ProofState>;

  public connectionId?: string;
}
