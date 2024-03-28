import { IsNotEmpty, IsString } from "class-validator";
import { BaseRecordDto } from "./base.record.dto";
import { BasicMessageRole } from "@credo-ts/core";

export class MessageRecordDto extends BaseRecordDto {
  // @example 6464b521-005a-4379-91e0-a3692b31cafd
  @IsNotEmpty()
  @IsString()
  connectionId: string;

  @IsNotEmpty()
  @IsString()
  role: BasicMessageRole;

  @IsNotEmpty()
  @IsString()
  sentTime: string;

  // @example "example-ocm-name"
  @IsString()
  from?: string;

  // @example "example-ocm-name"
  @IsString()
  to?: string;

  // @example "hello world"
  @IsNotEmpty()
  @IsString()
  content: string;
}
