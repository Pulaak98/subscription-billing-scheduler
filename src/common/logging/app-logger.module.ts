import {
  Global,
  Module,
} from '@nestjs/common';

import {
  CorrelationModule,
} from '../correlation/correlation.module';

import {
  AppLoggerService,
} from './app-logger.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    CorrelationModule,
  ],
  providers: [
    AppLoggerService,
  ],
  exports: [
    AppLoggerService,
  ],
})
export class AppLoggerModule {}