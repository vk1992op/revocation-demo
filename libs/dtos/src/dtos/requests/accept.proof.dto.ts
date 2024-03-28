import { IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class AcceptProofDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.proofUrl === undefined)
  proofId: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.proofId === undefined)
  proofUrl: string;
}
