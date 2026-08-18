import { MonthlyBillingRecurrenceCalculator } from './monthly-billing-recurrence.calculator';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('MonthlyBillingRecurrenceCalculator', () => {
  let calculator: MonthlyBillingRecurrenceCalculator;

  beforeEach(() => {
    calculator =
      new MonthlyBillingRecurrenceCalculator();
  });

  describe('normal monthly anchors', () => {
    it('should preserve a normal monthly anchor', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-01-15',
          billingAnchorDay: 15,
          anchorIsMonthEnd: false,
        }),
      ).toBe('2026-02-15');
    });

    it('should advance from the last day of a 30-day month', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-04-30',
          billingAnchorDay: 30,
          anchorIsMonthEnd: false,
        }),
      ).toBe('2026-05-30');
    });
  });

  describe('short month handling', () => {
    it('should clamp January 31 to February 28', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-01-31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: false,
        }),
      ).toBe('2026-02-28');
    });

    it('should restore the original day after February', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-02-28',
          billingAnchorDay: 31,
          anchorIsMonthEnd: false,
        }),
      ).toBe('2026-03-31');
    });

    it('should handle February 29 during a leap year', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2028-01-31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: false,
        }),
      ).toBe('2028-02-29');
    });

    it('should restore January 31 after leap-year February', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2028-02-29',
          billingAnchorDay: 31,
          anchorIsMonthEnd: false,
        }),
      ).toBe('2028-03-31');
    });
  });

  describe('explicit month-end anchors', () => {
    it('should always resolve to the last day of the target month', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-02-28',
          billingAnchorDay: 28,
          anchorIsMonthEnd: true,
        }),
      ).toBe('2026-03-31');
    });

    it('should keep April month-end subscriptions at month-end', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-04-30',
          billingAnchorDay: 30,
          anchorIsMonthEnd: true,
        }),
      ).toBe('2026-05-31');
    });

    it('should resolve February month-end correctly', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-01-31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: true,
        }),
      ).toBe('2026-02-28');
    });

    it('should resolve leap-year February month-end correctly', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2028-01-31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: true,
        }),
      ).toBe('2028-02-29');
    });
  });

  describe('year boundary', () => {
    it('should advance December to January of the next year', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-12-15',
          billingAnchorDay: 15,
          anchorIsMonthEnd: false,
        }),
      ).toBe('2027-01-15');
    });

    it('should preserve month-end across the year boundary', () => {
      expect(
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-12-31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: true,
        }),
      ).toBe('2027-01-31');
    });
  });

  describe('validation', () => {
    it('should reject an invalid billing date format', () => {
      expect(() =>
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026/01/31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: false,
        }),
      ).toThrow(
        'currentBillingDate must be in YYYY-MM-DD format',
      );
    });

    it('should reject an invalid calendar date', () => {
      expect(() =>
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-02-31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: false,
        }),
      ).toThrow(
        'currentBillingDate must be a valid calendar date',
      );
    });

    it('should reject an invalid anchor day', () => {
      expect(() =>
        calculator.calculateNextBillingDate({
          currentBillingDate: '2026-01-15',
          billingAnchorDay: 32,
          anchorIsMonthEnd: false,
        }),
      ).toThrow(
        'billingAnchorDay must be between 1 and 31',
      );
    });
  });
});