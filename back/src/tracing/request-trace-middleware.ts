import { TracerFactory } from './tracer-factory';
import { TraceStoreFactory } from './trace-store-factory';

export function requestTraceMiddleware(config) {
  return (req, res, next) => {
    if (!config.enabled) {
      next();
      return;
    }

    try {
      if (req.method === 'OPTIONS') {
        next();
        return;
      }

      const tracer = TracerFactory.create(config);
      const { url, method } = req;
      const { span, traceData } = tracer.startTransactionSpan({ url, requestMethod: method });
      req.uuid = traceData.transactionId;
      res.on('finish', () => span.finish());
      TraceStoreFactory.makeAvailableInRequest({ traceData, req, res, next });
    } catch (e) {
      next();
    }
  };
}

