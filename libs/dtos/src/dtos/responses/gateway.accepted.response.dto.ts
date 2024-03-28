import { IsUUID } from "class-validator";

export class GatewayAcceptedResponseDto {
  //@example 80633e6d-c606-4539-a3df-287fedd09253
  //@description test mest
  @IsUUID()
  id: string;
}
