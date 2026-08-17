import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { CorrelationModule } from './common/correlation/correlation.module';
import { ClockModule } from './common/clock/clock.module';
import { AppLoggerModule } from './common/logging/app-logger.module';
import { ShutdownModule } from './common/shutdown/shutdown.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    DatabaseModule,
    ClockModule,
    CorrelationModule,
    AppLoggerModule,
    ShutdownModule,
    SubscriptionModule,
  ],
})
export class AppModule {}