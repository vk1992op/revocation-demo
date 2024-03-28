import { IsUri } from "@credo-ts/core/build/utils";

export class W3cHolderDto {
  @IsUri()
  public id!: string;
}
