import Tracer, { StartSpanOptions, TraceOptions } from './tracer';
import api, { Span } from "@opentelemetry/api";

export interface TracerFacade {
  get: () => Tracer;
  startSpan: (StartSpanOptions) => Span;
  trace: (opt: TraceOptions, fn: Function) => ((...args: any[]) => any);
  traceRequest: (req: any, res: any, next: any) => void;
  traceAction: (store: any) => Function;
}

const getTracer = (): Tracer => {
  const otlTracer = api.trace.getTracer("my-library-name", "0.2.3");
  return new Tracer(otlTracer);
};

export class TracerFactory {
  public static create(): TracerFacade {
    return {
      get(): Tracer {
        return getTracer();
      },
      startSpan(options: StartSpanOptions): Span {
        return getTracer().startSpan(options);
      },
      trace(options: TraceOptions, originalFn: Function): ((...args: any[]) => any) {
        return (...originalArgs): any => {
            return getTracer().trace(options, originalFn, originalArgs);
        };
      },
      traceRequest(req, res, next) {
        try {
          if (req.method === 'OPTIONS') {
            next();
            return;
          }
          const tracer = TracerFactory.create();
          const {url, method} = req;
          const span = tracer.startSpan({url, requestMethod: method});
          res.on('finish', () => span.end());
        } catch (e) {
          next();
        }
      },
      traceAction(store) {
        return function (next) {
          return function (action) {
            const { type, error } = action;
            if(!(type || '').startsWith('_FAIL')) next(action);
            if(!(error)) next(action);
            const span = this.startSpan({ action: action.type });
            span.addEvent(`${type}.exception`, { 'exception.type': error.name, 'exception.message': error.message, 'exception.stacktrace': error.stack, 'error.object': error });
            next(action);
            span.end();
          }
        }
      }
    }
  }
}
