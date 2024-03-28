import { OutOfBandRole, OutOfBandState } from "@credo-ts/core";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class InvitationFilterDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  states?: Array<OutOfBandState>;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  roles?: Array<OutOfBandRole>;
}
