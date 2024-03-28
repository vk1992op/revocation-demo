import { CredentialPreviewAttributeOptions } from "@credo-ts/core";
import {
  AnonCredsCredential,
  AnonCredsCredentialOffer,
  AnonCredsCredentialProposalFormat,
  AnonCredsCredentialRequest,
} from "@credo-ts/anoncreds";

export class CredentialFormatDataDto {
  public proposalAttributes?: CredentialPreviewAttributeOptions[];
  public offerAttributes?: CredentialPreviewAttributeOptions[];
  public anoncredsProposal?: AnonCredsCredentialProposalFormat;
  public anoncredsOffer?: AnonCredsCredentialOffer;
  public anoncredsRequest?: AnonCredsCredentialRequest;
  public anoncredsCredential?: AnonCredsCredential;

  public all?: unknown;
}
