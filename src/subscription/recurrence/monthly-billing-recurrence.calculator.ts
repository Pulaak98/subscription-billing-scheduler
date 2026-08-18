export interface MonthlyBillingRecurrenceInput {
  currentBillingDate: string;
  billingAnchorDay: number;
  anchorIsMonthEnd: boolean;
}

export class MonthlyBillingRecurrenceCalculator {
  calculateNextBillingDate(
    input: MonthlyBillingRecurrenceInput,
  ): string {
    const {
      currentBillingDate,
      billingAnchorDay,
      anchorIsMonthEnd,
    } = input;

    this.validateDate(currentBillingDate);
    this.validateAnchorDay(billingAnchorDay);

    const currentDate = this.parseDate(currentBillingDate);

    const nextYear =
      currentDate.getUTCMonth() === 11
        ? currentDate.getUTCFullYear() + 1
        : currentDate.getUTCFullYear();

    const nextMonth =
      (currentDate.getUTCMonth() + 1) % 12;

    const lastDayOfNextMonth =
      new Date(
        Date.UTC(nextYear, nextMonth + 1, 0),
      ).getUTCDate();

    const targetDay = anchorIsMonthEnd
      ? lastDayOfNextMonth
      : Math.min(
          billingAnchorDay,
          lastDayOfNextMonth,
        );

    return this.formatDate(
      new Date(
        Date.UTC(
          nextYear,
          nextMonth,
          targetDay,
        ),
      ),
    );
  }

  private validateDate(value: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(
        'currentBillingDate must be in YYYY-MM-DD format',
      );
    }

    const date = this.parseDate(value);

    if (this.formatDate(date) !== value) {
      throw new Error(
        'currentBillingDate must be a valid calendar date',
      );
    }
  }

  private validateAnchorDay(
    billingAnchorDay: number,
  ): void {
    if (
      !Number.isInteger(billingAnchorDay) ||
      billingAnchorDay < 1 ||
      billingAnchorDay > 31
    ) {
      throw new Error(
        'billingAnchorDay must be between 1 and 31',
      );
    }
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value
      .split('-')
      .map(Number);

    return new Date(
      Date.UTC(year, month - 1, day),
    );
  }

  private formatDate(date: Date): string {
    const year = date
      .getUTCFullYear()
      .toString()
      .padStart(4, '0');

    const month = (date.getUTCMonth() + 1)
      .toString()
      .padStart(2, '0');

    const day = date
      .getUTCDate()
      .toString()
      .padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}