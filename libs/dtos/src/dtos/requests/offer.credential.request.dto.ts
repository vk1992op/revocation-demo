import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { W3cCredentialDto } from "../credo/w3c/credential/w3c.credential.dto";

export class OfferCredentialAttributes {
  @IsString()
  name: string;

  @IsString()
  value: string;
}

export class OfferCredentialRequestDto {
  //@example 6464b521-005a-4379-91e0-a3692b31cafd
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  connectionId?: string;

  //@example did:indy:LEDGER:5Pf67NsEtnU42GJGETT6Xe/anoncreds/v0/CLAIM_DEF/855916/test mest cred def
  @IsString()
  @IsNotEmpty()
  credentialDefinitionId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfferCredentialAttributes)
  attributes: Array<OfferCredentialAttributes>;

  @IsBoolean()
  @IsOptional()
  revocable: boolean;
}

export class OfferJsonCredentialRequests {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  connectionId?: string;

  doc: W3cCredentialDto;
}

export class SignJsonCredentialRequests {
  doc: W3cCredentialDto;
}
