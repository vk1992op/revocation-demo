import { IsDateString, IsString } from "class-validator";

export class BaseRecordDto {
  @IsString()
  id?: string;

  @IsDateString()
  createdAt?: Date;

  @IsDateString()
  updatedAt?: Date;
}
