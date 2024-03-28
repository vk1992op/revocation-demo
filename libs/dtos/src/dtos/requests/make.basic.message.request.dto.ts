import { IsNotEmpty, IsString } from "class-validator";

export class MakeBasicMessageRequestDto {
  // @example 6464b521-005a-4379-91e0-a3692b31cafd
  @IsNotEmpty()
  @IsString()
  connectionId: string;

  // @example "hello world"
  @IsNotEmpty()
  @IsString()
  message: string;
}
