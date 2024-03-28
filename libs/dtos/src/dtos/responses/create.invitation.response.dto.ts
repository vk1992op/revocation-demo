import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { BaseRecordDto } from "../generics/base.record.dto";
import { OutOfBandRole, OutOfBandState } from "@credo-ts/core";

export class CreateInvitationResponseDto extends BaseRecordDto {
  /**
   * Example of long invitation url
   * @example "http://0.0.0.0:8001?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIzYWExNGIzNC04YTk5LTQxY2UtYTY3NC1jODUxYmVhMTIxMWEiLCJsYWJlbCI6IkRFeGNWYXNkX0FHRU5UXzQ1IiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHA6Ly8wLjAuMC4wOjgwMDEiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa3VFcHllc1pNa3k0a1BpQzhEOEplZERlcm55YTFuaTREMUF3ZmdnWWt6YmR4Il0sInJvdXRpbmdLZXlzIjpbXX1dfQ"
   */
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.shortInvitationUrl === undefined)
  invitationUrl?: string;

  /**
   *
   * @example "http://0.0.0.0:8001/invitations/85a7c179-122b-4d2d-9a86-d92ad31cef2b"
   */
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.invitationUrl === undefined)
  shortInvitationUrl?: string;

  /**
   * @example "85a7c179-122b-4d2d-9a86-d92ad31cef2b"
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  outOfBandId?: string;

  /**
   * @example "sender"
   */
  @IsOptional()
  @IsString()
  role?: OutOfBandRole;

  /**
   * @example "Done"
   */
  @IsOptional()
  @IsString()
  state?: OutOfBandState;
}
