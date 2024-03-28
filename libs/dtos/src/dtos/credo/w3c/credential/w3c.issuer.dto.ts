import { IsUri } from "@credo-ts/core/build/utils";

export class W3cIssuerDto {
  @IsUri()
  public id!: string;
}
