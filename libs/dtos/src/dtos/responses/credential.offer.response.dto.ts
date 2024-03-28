import { CredentialRecordDto } from "../generics/credential.record.dto";

export class CredentialOfferResponseDto {
  public credentialUrl: string | null;
  public shortCredentialUrl: string | null;
  public credentialRecord: CredentialRecordDto;
  public revocationStatusListIndex?: number | undefined;
  public revocationRegistryId?: string | undefined;
}
