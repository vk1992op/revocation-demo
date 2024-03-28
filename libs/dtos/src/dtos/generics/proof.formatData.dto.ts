import {
  AnonCredsProof,
  AnonCredsProofRequest,
} from "@credo-ts/anoncreds";

export class ProofFormatDataDto {
  public anoncredsProposal?: AnonCredsProofRequest;
  public anoncredsRequest?: AnonCredsProofRequest;
  public anoncredsPresentation?: AnonCredsProof;
}
