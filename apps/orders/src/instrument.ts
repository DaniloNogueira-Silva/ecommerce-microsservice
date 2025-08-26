import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import {
  resourceFromAttributes,
} from '@opentelemetry/resources';

export const initTracing = () => {
  const resource = resourceFromAttributes({
    ['service.name']: 'orders-service',
  });

  const sdk = new NodeSDK({
    resource,
    spanProcessor: new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
      }),
    ),
    instrumentations: [
      new NestInstrumentation(),
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PgInstrumentation(),
    ],
  });

  sdk.start();
  console.log('Tracing initialized successfully.');

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated.'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });

  return sdk;
};
