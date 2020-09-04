import { Span } from 'opentracing';
import TraceStore from './trace-store';
import Tracer from './tracer';

export const TraceStoreFactory = {
  traceStore: TraceStore,
  makeAvailableInRequest({ traceData, req, res, next }): void {
    this.traceStore.makeAvailableInRequest(traceData, req, res, next);
  },
  makeAvailableInConsumer(traceData, emitter, callback): Promise<any> {
    return this.traceStore.makeAvailableInConsumer(traceData, emitter, callback);
  },
  hasTracer(): boolean {
    try {
      const tracer = this.traceStore.get('tracer');
      if (tracer) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
  getTracer(): Tracer | null {
    try {
      const tracer = this.traceStore.get('tracer');
      return tracer;
    } catch (e) {
      return null;
    }
  },
  setTracer(tracer: Tracer): Tracer | null {
    try {
      this.traceStore.set('tracer', tracer);
      return tracer;
    } catch (e) {
      return null;
    }
  },
  getCurrentTransactionSpan(): Span | null {
    try {
      const transactionSpan = this.traceStore.get('transactionSpan');
      return transactionSpan;
    } catch (e) {
      return null;
    }
  },
  hasTransactionSpan(): boolean {
    try {
      const transactionSpan = this.traceStore.get('transactionSpan');
      if (transactionSpan) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
};

