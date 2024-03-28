import { IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class AcceptCredentialDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.credentialUrl === undefined)
  credentialId: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.credentialId === undefined)
  credentialUrl: string;
}
