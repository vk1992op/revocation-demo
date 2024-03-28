import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

export class CreateInvitationRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  goal?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  alias?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  multiUseInvitation?: boolean;
}
