import { Span, SpanOptions, Tracer as Opentracer, SpanContext } from 'opentracing';

export type CreateTracerOptions = {
  enabled?: boolean;
  shortOutputEnabled?: boolean;
};

export type StartSpanOptions = {
  withResultLogged?: boolean;
  withArgsLogged?: boolean;
  withSpanInArgs?: boolean;
  spanOptions?: SpanOptions;
} & OperationNameOptions & SpanOptions & CreateTracerOptions;

export type TraceOptions = {
  spanOptions?: SpanOptions;
  context?: unknown;
  withResultLogged?: boolean;
  withArgsLogged?: boolean;
  withSpanInArgs?: boolean;
} & OperationNameOptions;

export type OperationNameOptions =
  GenericOptions &
  ComponentTraceOptions &
  RequestTraceOptions &
  ConsumerTraceOptions;

export interface GenericOptions {
  operationName?: string;
  isPromise?: boolean;
}

export interface ComponentTraceOptions {
  component?: string;
  method?: string | null;
  isPromise?: boolean;
}

export interface RequestTraceOptions {
  url?: string;
  requestMethod?: string;
  isPromise?: boolean;
}


export interface ConsumerTraceOptions {
  url?: string;
  consumer?: string;
  isPromise?: boolean;
}

function getOperationName({
  operationName,
  component,
  method,
  // eslint-disable-next-line no-shadow
  isPromise = false,
  url,
  requestMethod,
  consumer,
}: OperationNameOptions): string {
  if (operationName) {
    return JSON.stringify({ operationName, isPromise });
  }

  if (component || method) {
    return JSON.stringify({
      component: component || 'Unnamed component',
      method: method || 'Unnamed method',
      isPromise,
    });
  }

  if (url && requestMethod) {
    return JSON.stringify({ url, requestMethod });
  }


  if (url && consumer) {
    return JSON.stringify({ url, consumer });
  }

  return JSON.stringify({ name: 'Unnamed component and method' });
}

function isFunction(fn): boolean {
  return fn && typeof fn === 'function';
}

function isPromise(fn: any): boolean {
  return fn && typeof fn.then === 'function';
}

export default class Tracer {
  private opentracer: Opentracer;

  public constructor({ opentracer }: { opentracer: Opentracer }) {
    if (!opentracer) {
      throw new Error('A Opentracing compatible Tracer is needed.');
    }
    this.opentracer = opentracer;
  }

  private tracePromise(promise: any, nameOptions, span: Span): any {
    return promise
      .then((res: any) => {
        const name = getOperationName({ ...nameOptions, isPromise: true });
        this.opentracer.startSpan(name, { childOf: span })
          .setTag('result', res)
          .finish();
        return res;
      })
      .catch((err: Error) => {
        const name = getOperationName({ ...nameOptions, isPromise: true });
        this.opentracer.startSpan(name, { childOf: span })
          .log({ event: 'error', name: err.name, message: err.message, stack: err.stack, 'error.object': err })
          .finish();
        throw err;
      });
  }

  public trace({
    operationName,
    component,
    method,
    url,
    requestMethod,
    context,
    withArgsLogged = true,
    withResultLogged = true,
    withSpanInArgs = false,
    spanOptions,
  }: TraceOptions,
  originalFn,
  originalArgs): any {
    const nameOptions = { operationName, component, method, url, requestMethod };

    const name = getOperationName(nameOptions);
    if (!isFunction(originalFn)) {
      throw new Error(`Tried to trace ${name}, but it isn't a method/function`);
    }

    const span: Span = this.opentracer.startSpan(name, spanOptions);

    if (withArgsLogged) {
      originalArgs.forEach(
        (arg, index) => span.setTag(`param.${index}`, arg));
    }

    try {
      const result: any = originalFn.apply(
        context,
        withSpanInArgs ? [...originalArgs, span] : originalArgs,
      );

      if (isPromise(result)) {
        if (withResultLogged) {
          span.setTag('result', 'a promise is pending resolution.');
        }
        return this.tracePromise(result, nameOptions, span);
      }

      if (withResultLogged) {
        span.setTag('result', result);
      }
      return result;
    } catch (e) {
      span.log({ event: 'error', name: e.name, message: e.message, stack: e.stack, 'error.object': e });
      throw e;
    } finally {
      span.finish();
    }
  }

  public startSpan(options: StartSpanOptions): Span {
    const name = getOperationName(options);
    return this.opentracer.startSpan(name, options);
  }

  public extract(format: string, carrier: any): SpanContext | null {
    return this.opentracer.extract(format, carrier);
  }
}

export const NoopTracer = {
  startSpan(): Span {
    return new Span();
  },

  trace(
    originalFn,
    originalArgs,
    originalContext: unknown,
    withSpanInArgs = false,
  ): any {
    const result: any = originalFn.apply(
      originalContext,
      withSpanInArgs ? [...originalArgs, new Span()] : originalArgs,
    );

    return result;
  },
};
