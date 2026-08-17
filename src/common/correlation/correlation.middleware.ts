import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import {
  CORRELATION_ID_HEADER,
  createCorrelationId,
} from './correlation-id';

import { CorrelationContextService } from './correlation-context.service';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(
    private readonly correlationContext: CorrelationContextService,
  ) {}

  use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const incomingCorrelationId =
      request.header(CORRELATION_ID_HEADER);

    const correlationId =
      incomingCorrelationId || createCorrelationId();

    request.headers[CORRELATION_ID_HEADER] = correlationId;

    response.setHeader(
      CORRELATION_ID_HEADER,
      correlationId,
    );

    this.correlationContext.run(
      correlationId,
      () => next(),
    );
  }
}