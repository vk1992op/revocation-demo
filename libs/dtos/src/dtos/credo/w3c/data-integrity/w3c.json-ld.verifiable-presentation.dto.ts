import {
  IsInstanceOrArrayOfInstances,
  SingleOrArray,
} from "@credo-ts/core/build/utils";
import { ProofTransformer as LinkedDataProofTransformer } from "@credo-ts/core/build/modules/vc/data-integrity/models/ProofTransformer";
import { LinkedDataProofDto } from "./linked-data-proof.dto";
import { W3cPresentationDto } from "../presentation/w3c.presentation.dto";

export class W3cJsonLdVerifiablePresentationDto extends W3cPresentationDto {
  @LinkedDataProofTransformer()
  @IsInstanceOrArrayOfInstances({ classType: LinkedDataProofDto })
  public proof!: SingleOrArray<LinkedDataProofDto>;
}
