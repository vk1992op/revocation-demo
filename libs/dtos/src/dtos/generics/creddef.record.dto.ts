import { IsNotEmpty, IsString } from "class-validator";
import { BaseRecordDto } from "./base.record.dto";

export class CreddefRecordDto extends BaseRecordDto {
  @IsNotEmpty()
  @IsString()
  schemaId: string;

  @IsNotEmpty()
  @IsString()
  issuerId: string;

  @IsNotEmpty()
  @IsString()
  tag: string;
}
