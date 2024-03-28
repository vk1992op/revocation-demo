import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCredentialDefinitionRequestDto {
  @IsNotEmpty()
  @IsString()
  schemaId: string;

  @IsNotEmpty()
  @IsString()
  tag: string;

  @IsBoolean()
  @IsOptional()
  supportRevocation?: boolean = false;
}
