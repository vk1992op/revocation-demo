import { ValidateNested } from "class-validator";
import {
  IsInstanceOrArrayOfInstances,
  SingleOrArray,
} from "@credo-ts/core/build/utils";
import { ProofTransformer as LinkedDataProofTransformer } from "@credo-ts/core/build/modules/vc/data-integrity/models/ProofTransformer";
import { LinkedDataProofDto } from "./linked-data-proof.dto";
import { W3cCredentialDto } from "../credential/w3c.credential.dto";

export class W3cJsonLdVerifiableCredentialDto extends W3cCredentialDto {
  @LinkedDataProofTransformer()
  @IsInstanceOrArrayOfInstances({ classType: LinkedDataProofDto })
  @ValidateNested()
  public proof!: SingleOrArray<LinkedDataProofDto>;
}
