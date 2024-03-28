import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { OfferCredentialAttributes } from "../requests/offer.credential.request.dto";
import { BaseRecordDto } from "./base.record.dto";
import { CredentialState } from "@credo-ts/core";

export class CredentialRecordDto extends BaseRecordDto {
  @IsNotEmpty()
  @IsString()
  public state: CredentialState;

  @IsNotEmpty()
  @IsString()
  credentialRecordType: string;

  @IsString()
  connectionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferCredentialAttributes)
  attributes?: Array<OfferCredentialAttributes>;

  tags: unknown;
}
