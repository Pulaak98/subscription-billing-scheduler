import {
  Global,
  Module,
} from '@nestjs/common';

import {
  AppLoggerModule,
} from '../logging/app-logger.module';

import {
  ShutdownService,
} from './shutdown.service';

@Global()
@Module({
  imports: [
    AppLoggerModule,
  ],
  providers: [
    ShutdownService,
  ],
  exports: [
    ShutdownService,
  ],
})
export class ShutdownModule {}