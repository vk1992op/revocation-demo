import { IsNotEmpty, IsString } from "class-validator";

export class CredentialReqDto {
  //@example cf8395a5-9a53-4e06-8a5d-04e0fc00ca04
  @IsNotEmpty()
  @IsString()
  credentialRecordId: string;
}
