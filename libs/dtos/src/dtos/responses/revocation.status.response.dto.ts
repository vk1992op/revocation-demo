import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RevocationStatusResponseDto {
  @IsString()
  @IsNotEmpty()
  revocationRegistryId: string;

  @IsBoolean()
  @IsNotEmpty()
  valid: boolean;

  @IsNumber()
  @IsNotEmpty()
  revocationId: number;

  @IsString()
  @IsOptional()
  message?: string | undefined;
}
