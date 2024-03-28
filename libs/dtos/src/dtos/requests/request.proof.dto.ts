import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class RequestProofAttribute {
  @IsString()
  @IsNotEmpty()
  attributeName: string;

  @IsString()
  @IsNotEmpty()
  credentialDefinitionId: string;

  @IsString()
  @IsNotEmpty()
  schemaId: string;
}

export class RequestProofDto {
  //@example 6464b521-005a-4379-91e0-a3692b31cafd
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  connectionId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RequestProofAttribute)
  attributes: Array<RequestProofAttribute>;
}
