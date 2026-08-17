import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { CorrelationContextService } from './correlation-context.service';
import { CorrelationMiddleware } from './correlation.middleware';

@Global()
@Module({
  providers: [
    CorrelationContextService,
  ],
  exports: [
    CorrelationContextService,
  ],
})
export class CorrelationModule implements NestModule {
  configure(
    consumer: MiddlewareConsumer,
  ): void {
    consumer
      .apply(CorrelationMiddleware)
      .forRoutes('*');
  }
}