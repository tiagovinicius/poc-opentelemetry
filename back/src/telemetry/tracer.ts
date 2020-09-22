import {
  Span,
  SpanOptions,
  Tracer as OtlTracer
} from "@opentelemetry/api";

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
    return `${operationName}${isPromise ? '.promise' : ''}`;
  }

  if (component || method) {
    return `${component || 'unknown'}.${method || 'unknown'}${isPromise ? '.promise' : ''}`;
  }

  if (url && requestMethod) {
    return `${requestMethod}//${url}`;
  }


  if (url && consumer) {
    return `${url}/${consumer}`;
  }

  return 'unknown';
}

function isFunction(fn: any): boolean {
  return fn && typeof fn === 'function';
}

function isPromise(fn: any): boolean {
  return fn && typeof fn.then === 'function';
}

export default class Tracer {
  private otlTracer: OtlTracer;

  public constructor(otlTracer) {
    if (!otlTracer) {
      throw new Error('A Opentelemetry compatible Tracer is needed.');
    }
    this.otlTracer = otlTracer;
  }

  private tracePromise(promise: any, nameOptions: any, span: Span): any {
    return promise
      .then((res: any) => {
        const name = getOperationName({ ...nameOptions, isPromise: true });
        this.otlTracer.startSpan(name, { parent: span })
          .setAttribute(`${name}.result`, res)
          .end();
        return res;
      })
      .catch((err: Error) => {
        const name = getOperationName({ ...nameOptions, isPromise: true });
        this.otlTracer.startSpan(name, { parent: span })
          .addEvent(`${name}.exception`, { 'exception.type': err.name, 'exception.message': err.message, 'exception.stacktrace': err.stack, 'error.object': err })
          .end();
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
  originalFn: any,
  originalArgs: any): any {
    const nameOptions = { operationName, component, method, url, requestMethod };

    const name = getOperationName(nameOptions);
    if (!isFunction(originalFn)) {
      throw new Error(`Tried to trace ${name}, but it isn't a method/function`);
    }

    const span: Span = this.otlTracer.startSpan(name, spanOptions);

    if (withArgsLogged) {
      originalArgs.forEach(
        (arg: number, index: number) => span.setAttribute(`${name}.param.${index}`, arg));
    }

    try {
      const result: any = originalFn.apply(
        context,
        withSpanInArgs ? [...originalArgs, span] : originalArgs,
      );

      if (isPromise(result)) {
        if (withResultLogged) {
          span.setAttribute(`${name}.result`, 'a promise is pending resolution.');
        }
        // return this.tracePromise(result, nameOptions, span);
      }

      if (withResultLogged) {
        span.setAttribute(`${name}.result`, result);
      }
      return result;
    } catch (e) {
      span.addEvent(`${name}.exception`, { 'exception.type': e.name, 'exception.message': e.message, 'exception.stacktrace': e.stack, 'error.object': e });
      throw e;
    } finally {
      span.end();
    }
  }

  public startSpan(options: StartSpanOptions): Span {
    const name = getOperationName(options);
    return this.otlTracer.startSpan(name, options);
  }
}
