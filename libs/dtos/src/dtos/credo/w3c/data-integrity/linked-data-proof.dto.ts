import { IsOptional, IsString } from "class-validator";
import { IsUri } from "@credo-ts/core/build/utils";

export class LinkedDataProofDto {
  @IsString()
  public type!: string;

  @IsString()
  public proofPurpose!: string;

  @IsString()
  public verificationMethod!: string;

  @IsString()
  public created!: string;

  @IsUri()
  @IsOptional()
  public domain?: string;

  @IsString()
  @IsOptional()
  public challenge?: string;

  @IsString()
  @IsOptional()
  public jws?: string;

  @IsString()
  @IsOptional()
  public proofValue?: string;

  @IsString()
  @IsOptional()
  public nonce?: string;
}
