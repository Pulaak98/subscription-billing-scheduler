import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  customerReference!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Matches(/^\d+(\.\d{1,4})?$/, {
    message:
      'amount must be a valid positive number with up to 4 decimal places',
  })
  amount!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  nextBillingDate!: string;

  @IsInt()
  @Min(1)
  @Max(31)
  billingAnchorDay!: number;

  @IsBoolean()
  anchorIsMonthEnd!: boolean;
}