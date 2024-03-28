import { IsString } from "class-validator";
import { IsUri } from "@credo-ts/core/build/utils";

export class W3cCredentialStatusDto {
  @IsUri()
  public id!: string;

  @IsString()
  public type!: string;
}
