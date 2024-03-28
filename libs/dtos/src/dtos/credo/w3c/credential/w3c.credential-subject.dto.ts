import { IsOptional } from "class-validator";
import { IsUri } from "@credo-ts/core/build/utils";

export class W3cCredentialSubjectDto {
  @IsUri()
  @IsOptional()
  public id?: string;
}
