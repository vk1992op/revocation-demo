import { IsNotEmpty, IsString } from "class-validator";
import { BaseRecordDto } from "./base.record.dto";
import { ProofState } from "@credo-ts/core";

export class ProofRecordDto extends BaseRecordDto {
  @IsString()
  connectionId?: string;

  @IsString()
  @IsNotEmpty()
  state: ProofState;

  tags: unknown;
}
