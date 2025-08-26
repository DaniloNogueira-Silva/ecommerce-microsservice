import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

export const initTracing = () => {
  const sdk = new NodeSDK({
    resource: new Resource({
      ['service.name']: 'orders-service',
    }),
    spanProcessor: new SimpleSpanProcessor(
      new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' }),
    ),
    instrumentations: [
      new NestInstrumentation(),
      new HttpInstrumentation(),
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
