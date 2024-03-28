import { Expose, Type } from "class-transformer";
import {
  IsInstance,
  IsOptional,
  IsRFC3339,
  ValidateNested,
} from "class-validator";

import { W3cCredentialSchemaDto } from "./w3c.credential-schema.dto";
import { W3cCredentialStatusDto } from "./w3c.credential-status.dto";
import { W3cCredentialSubjectDto } from "./w3c.credential-subject.dto";
import { W3cIssuerDto } from "./w3c.issuer.dto";
import { IsCredentialJsonLdContext } from "@credo-ts/core/build/modules/vc/validators";
import {
  IsCredentialType,
  IsW3cIssuer,
  JsonObject,
  W3cIssuerTransformer,
} from "@credo-ts/core";
import {
  IsInstanceOrArrayOfInstances,
  IsUri,
  SingleOrArray,
} from "@credo-ts/core/build/utils";

export class W3cCredentialDto {
  @Expose({ name: "@context" })
  @IsCredentialJsonLdContext()
  public context!: Array<string | JsonObject>;

  @IsOptional()
  @IsUri()
  public id?: string;

  @IsCredentialType()
  public type!: Array<string>;

  @W3cIssuerTransformer()
  @IsW3cIssuer()
  public issuer!: string | W3cIssuerDto;

  @IsRFC3339()
  public issuanceDate!: string;

  @IsRFC3339()
  @IsOptional()
  public expirationDate?: string;

  @Type(() => W3cCredentialSubjectDto)
  @ValidateNested({ each: true })
  @IsInstanceOrArrayOfInstances({ classType: W3cCredentialSubjectDto })
  public credentialSubject!: SingleOrArray<W3cCredentialSubjectDto>;

  @IsOptional()
  @Type(() => W3cCredentialSchemaDto)
  @ValidateNested({ each: true })
  @IsInstanceOrArrayOfInstances({
    classType: W3cCredentialSchemaDto,
    allowEmptyArray: true,
  })
  public credentialSchema?: SingleOrArray<W3cCredentialSchemaDto>;

  @IsOptional()
  @Type(() => W3cCredentialStatusDto)
  @ValidateNested({ each: true })
  @IsInstance(W3cCredentialStatusDto)
  public credentialStatus?: W3cCredentialStatusDto;
}
