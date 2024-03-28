import { IsNotEmpty, IsString } from "class-validator";
import { BaseRecordDto } from "./base.record.dto";
import { DidDocumentRole } from "@credo-ts/core";

export class DidRecordDto extends BaseRecordDto {
  @IsNotEmpty()
  @IsString()
  did: string;

  @IsNotEmpty()
  @IsString()
  role: DidDocumentRole;

  @IsString()
  @IsNotEmpty()
  method: string;

  tags: unknown;
}
