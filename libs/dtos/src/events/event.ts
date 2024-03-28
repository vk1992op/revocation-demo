import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsUUID,
} from "class-validator";
import { CloudEventV1 } from "cloudevents";
import { uuid } from "@credo-ts/core/build/utils/uuid";

export class CloudEventDto<T> implements CloudEventV1<T> {
  @IsNotEmpty()
  @IsUUID()
  id: string = uuid();

  @IsString()
  @IsNotEmpty()
  specversion = "V1";

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  dataschema?: string;

  @IsString()
  @IsOptional()
  datacontenttype?: string = "application/json";

  @IsOptional()
  @ValidateNested()
  data?: T;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  time?: string;

  [key: string]: unknown;
}
