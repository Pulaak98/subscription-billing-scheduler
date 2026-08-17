import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  customerReference!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Matches(/^\d+(?:\.\d{1,4})?$/, {
    message:
      'amount must be a valid positive number with up to 4 decimal places',
  })
  amount!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @Matches(DATE_ONLY_REGEX, {
    message: 'startDate must be a valid date in YYYY-MM-DD format',
  })
  startDate!: string;

  @Matches(DATE_ONLY_REGEX, {
    message: 'nextBillingDate must be a valid date in YYYY-MM-DD format',
  })
  nextBillingDate!: string;

  @IsInt()
  @Min(1)
  @Max(31)
  billingAnchorDay!: number;

  @IsBoolean()
  anchorIsMonthEnd!: boolean;
}