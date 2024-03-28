import { IsNotEmpty, IsString } from "class-validator";

export class IdReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
