import { Global, Module } from '@nestjs/common';

import { SystemClock } from './system-clock';

@Global()
@Module({
  providers: [
    {
      provide: 'CLOCK',
      useClass: SystemClock,
    },
  ],
  exports: ['CLOCK'],
})
export class ClockModule {}