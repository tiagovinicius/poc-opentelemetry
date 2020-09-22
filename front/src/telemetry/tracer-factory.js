import { Tracer } from './tracer';
import api from '@opentelemetry/api';

const getTracer = () => {
  const otlTracer = api.trace.getTracer("my-library-name", "0.2.3");
  return new Tracer(otlTracer);
};

export class TracerFactory {
  create() {
    return {
      get() {
        return getTracer();
      },
      startSpan(options) {
        return getTracer().startSpan(options);
      },
      trace(options, originalFn) {
        return (...originalArgs) => {
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
            if(!(type || '').endsWith('_FAIL')) return next(action);
            if(!(error)) return next(action);
            const span = getTracer().startSpan({ operationName: `action.${type}` });
            span.addEvent(`${action.type}.exception`, { 'exception.type': error.name, 'exception.message': error.message, 'exception.stacktrace': error.stack, 'error.object': error });
            const result = next(action);
            span.end();
            return result;
          }
        }
      },
      traceUserInteraction(event) {
        const span = getTracer().startSpan({ operationName: `user-interaction.click[id='${event.target.id}']` });
        span.end();
      }
    }
  }
}
