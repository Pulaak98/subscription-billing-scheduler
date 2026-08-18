import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @Matches(/^\d+(?:\.\d{1,4})?$/, {
    message:
      'amount must be a valid positive number with up to 4 decimal places',
  })
  amount?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

  @IsOptional()
  @Matches(DATE_ONLY_REGEX, {
    message:
      'startDate must be a valid date in YYYY-MM-DD format',
  })
  startDate?: string;

  @IsOptional()
  @Matches(DATE_ONLY_REGEX, {
    message:
      'nextBillingDate must be a valid date in YYYY-MM-DD format',
  })
  nextBillingDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  billingAnchorDay?: number;

  @IsOptional()
  @IsBoolean()
  anchorIsMonthEnd?: boolean;
}