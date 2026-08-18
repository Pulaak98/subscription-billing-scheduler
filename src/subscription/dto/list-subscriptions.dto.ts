import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListSubscriptionsDto {
  @IsOptional()
  @IsString()
  customerReference?: string;

  @IsOptional()
  @IsIn(['active', 'paused', 'canceled'])
  status?: 'active' | 'paused' | 'canceled';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}