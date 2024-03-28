import { IsNotEmpty, IsString } from "class-validator";
import { BaseRecordDto } from "./base.record.dto";
import { DidExchangeState } from "@credo-ts/core";

export class ConnectionRecordDto extends BaseRecordDto {
  @IsNotEmpty()
  @IsString()
  state: DidExchangeState;

  @IsString()
  connectionName?: string;

  @IsString()
  alias?: string;

  @IsString()
  did?: string;

  @IsString()
  invitationDid?: string;

  @IsString()
  outOfBandId?: string;

  @IsString()
  imageUrl?: string;
}
