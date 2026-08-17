import { FakeClock } from './fake-clock';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

describe('FakeClock', () => {
  it('should return the configured time', () => {
    const initialTime = new Date(
      '2026-08-17T00:00:00.000Z',
    );

    const clock = new FakeClock(initialTime);

    expect(clock.now()).toEqual(initialTime);
  });

  it('should return a copy of the current time', () => {
    const initialTime = new Date(
      '2026-08-17T00:00:00.000Z',
    );

    const clock = new FakeClock(initialTime);

    const first = clock.now();
    const second = clock.now();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it('should allow the current time to be changed', () => {
    const clock = new FakeClock(
      new Date('2026-08-17T00:00:00.000Z'),
    );

    const newTime = new Date(
      '2026-08-18T00:00:00.000Z',
    );

    clock.set(newTime);

    expect(clock.now()).toEqual(newTime);
  });

  it('should advance time', () => {
    const clock = new FakeClock(
      new Date('2026-08-17T00:00:00.000Z'),
    );

    clock.advance(60_000);

    expect(clock.now()).toEqual(
      new Date('2026-08-17T00:01:00.000Z'),
    );
  });
});