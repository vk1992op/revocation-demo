import { ArrayMinSize, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateSchemaRequestDto {
  //@example "my test schema"
  @IsNotEmpty()
  @IsString()
  name: string;

  //@example ['first_name, last_name']
  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  attributes: string[];

  //@example 1.0.2
  @IsNotEmpty()
  @Matches(/^(\d+\.)?(\d+\.)?(\*|\d+)$/)
  version: string;
}
