import { Span, SpanContext, Tracer as Opentracer } from 'opentracing';
import { LocalOpentracer } from './local-opentracer';
import { TraceStoreFactory } from './trace-store-factory';
import Tracer, { NoopTracer, StartSpanOptions, TraceOptions } from './tracer';

type TransactionSpanParams = {
  url;
  requestMethod?: string;
  consumer?: string;
  childOf?: SpanContext;
};

export interface TracerFacade {
  get: () => Tracer;
  startSpan: (StartSpanOptions) => Span;
  extract: (format: string, carrier: any) => SpanContext | null;
  trace: (opt: TraceOptions, fn: Function) => ((...args: any[]) => any);
  startTransactionSpan: (
    { url, requestMethod, consumer, childOf }: TransactionSpanParams
  ) => { span: Span; traceData: any };
  hasCurrentTransactionSpan: () => boolean;
  enrichCurrentTransactionSpan: (tags: { [key: string]: any }) => void;
  getCurrentTransactionSpan: () => Span | null;
}

const getTracer = ({ shortOutputEnabled }): Tracer => {
  let tracer = TraceStoreFactory.getTracer();
  if (!tracer) {
    const opentracer = new LocalOpentracer({ shortOutputEnabled }) as Opentracer;

    tracer = new Tracer({ opentracer });
    TraceStoreFactory.setTracer(tracer);
  }
  return tracer;
};

export interface TracerFactoryOptions {
  enabled?: boolean;
  shortOutputEnabled?: boolean;
}

export class TracerFactory {
  private static defaultOptions: TracerFactoryOptions = {};

  public static registerDefaultOptions(options: TracerFactoryOptions): void {
    TracerFactory.defaultOptions = options;
  }

  public static create({
    enabled = false,
    shortOutputEnabled = false,
  }: TracerFactoryOptions = TracerFactory.defaultOptions): TracerFacade {
    return {
      get(): Tracer {
        return getTracer({ shortOutputEnabled });
      },
      startSpan(options: StartSpanOptions): Span {
        return enabled
          ? getTracer({ shortOutputEnabled }).startSpan(options)
          : NoopTracer.startSpan();
      },
      extract(format: string, carrier: any): SpanContext | null {
        return enabled
          ? getTracer({ shortOutputEnabled }).extract(format, carrier)
          : null;
      },
      trace(options: TraceOptions, originalFn: Function): ((...args: any[]) => any) {
        return (...originalArgs): any => {
          if (enabled) {
            return getTracer({ shortOutputEnabled }).trace(options, originalFn, originalArgs);
          }
          const { context, withSpanInArgs = false } = options;
          const trace = NoopTracer.trace(originalFn, originalArgs, context, withSpanInArgs);
          return trace;
        };
      },
      startTransactionSpan(nameOptions): { span: Span; traceData: object } {
        const tracer = getTracer({ shortOutputEnabled });
        const span = enabled
          ? tracer.startSpan(nameOptions)
          : NoopTracer.startSpan();

        const correlationId = span.context().toTraceId();
        const transactionId = span.context().toSpanId();
        const traceData = {
          correlationId,
          transactionId,
          transactionSpan: span,
          tracer,
        };
        return { span, traceData };
      },
      hasCurrentTransactionSpan(): boolean { return TraceStoreFactory.hasTransactionSpan(); },
      enrichCurrentTransactionSpan(tags: { [key: string]: any }): void {
        const transactionSpan = TraceStoreFactory.getCurrentTransactionSpan();
        if (transactionSpan) {
          transactionSpan.addTags(tags);
        }
      },
      getCurrentTransactionSpan(): Span | null {
        return TraceStoreFactory.getCurrentTransactionSpan();
      },
    };
  }
}
