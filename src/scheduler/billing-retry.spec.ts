import {
  describe,
  expect,
  it,
} from '@jest/globals';

import { calculateRetryAt } from './billing-retry';

describe('calculateRetryAt', () => {
  const now =
    new Date('2026-08-18T12:00:00.000Z');

  it('should schedule the first retry after 1 minute', () => {
    expect(
      calculateRetryAt(now, 1),
    ).toEqual(
      new Date(
        '2026-08-18T12:01:00.000Z',
      ),
    );
  });

  it('should schedule the second retry after 5 minutes', () => {
    expect(
      calculateRetryAt(now, 2),
    ).toEqual(
      new Date(
        '2026-08-18T12:05:00.000Z',
      ),
    );
  });

  it('should schedule the third retry after 15 minutes', () => {
    expect(
      calculateRetryAt(now, 3),
    ).toEqual(
      new Date(
        '2026-08-18T12:15:00.000Z',
      ),
    );
  });

  it('should schedule the fourth retry after 1 hour', () => {
    expect(
      calculateRetryAt(now, 4),
    ).toEqual(
      new Date(
        '2026-08-18T13:00:00.000Z',
      ),
    );
  });

  it('should cap later retries at 6 hours', () => {
    expect(
      calculateRetryAt(now, 5),
    ).toEqual(
      new Date(
        '2026-08-18T18:00:00.000Z',
      ),
    );

    expect(
      calculateRetryAt(now, 20),
    ).toEqual(
      new Date(
        '2026-08-18T18:00:00.000Z',
      ),
    );
  });
});