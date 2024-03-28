import { ArrayMinSize, IsNotEmpty, IsString } from "class-validator";
import { BaseRecordDto } from "./base.record.dto";

export class SchemaRecordDto extends BaseRecordDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString({ each: true })
  @ArrayMinSize(1)
  attributes: string[];

  @IsNotEmpty()
  @IsString()
  version: string;

  @IsString()
  issuerId?: string;

  @IsString()
  methodName?: string;
}
