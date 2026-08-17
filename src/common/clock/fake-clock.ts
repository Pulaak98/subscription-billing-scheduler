import { Clock } from './clock.interface';

export class FakeClock implements Clock {
  constructor(private currentTime: Date) {}

  now(): Date {
    return new Date(this.currentTime);
  }

  set(time: Date): void {
    this.currentTime = new Date(time);
  }

  advance(milliseconds: number): void {
    this.currentTime = new Date(
      this.currentTime.getTime() + milliseconds,
    );
  }
}