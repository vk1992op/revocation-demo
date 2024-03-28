import { Expose } from "class-transformer";
import { ValidateNested, IsOptional } from "class-validator";

import { W3cHolderDto } from "./w3c.holder.dto";
import {
  IsVerifiablePresentationType,
  JsonObject,
  W3cVerifiableCredentialTransformer,
} from "@credo-ts/core";
import { IsCredentialJsonLdContext } from "@credo-ts/core/build/modules/vc/validators";
import {
  IsInstanceOrArrayOfInstances,
  IsUri,
  SingleOrArray,
} from "@credo-ts/core/build/utils";
import {
  IsW3cHolder,
  W3cHolderTransformer,
} from "@credo-ts/core/build/modules/vc/models/presentation/W3cHolder";
import { W3cJsonLdVerifiableCredentialDto } from "../data-integrity/w3c.json-ld.verifiable-credential.dto";

export class W3cPresentationDto {
  @Expose({ name: "@context" })
  @IsCredentialJsonLdContext()
  public context!: Array<string | JsonObject>;

  @IsOptional()
  @IsUri()
  public id?: string;

  @IsVerifiablePresentationType()
  public type!: Array<string>;

  @W3cHolderTransformer()
  @IsW3cHolder()
  @IsOptional()
  public holder?: string | W3cHolderDto;

  @W3cVerifiableCredentialTransformer()
  @IsInstanceOrArrayOfInstances({
    classType: [W3cJsonLdVerifiableCredentialDto],
  })
  @ValidateNested({ each: true })
  public verifiableCredential!: SingleOrArray<W3cJsonLdVerifiableCredentialDto>;
}
