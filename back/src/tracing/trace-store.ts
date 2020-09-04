import cls from 'cls-hooked';

const clsNamespace = cls.createNamespace('trace-store');

interface TraceStore {
  makeAvailableInRequest: (
    traceData: object,
    req,
    res,
    next
  ) => void;
  makeAvailableInConsumer: (
    traceData: object,
    emitter,
    callback,
  ) => Promise<any>;
  setStore: (store: object) => TraceStore;
  set: (key: string, value: any) => TraceStore;
  get: (key: string) => any;
}

const TraceStore: TraceStore = {
  makeAvailableInRequest(traceData, req, res, next): void {
    clsNamespace.bindEmitter(req);
    clsNamespace.bindEmitter(res);
    clsNamespace.run(() => {
      this.setStore(traceData);
      next();
    });
  },
  makeAvailableInConsumer(traceData, emitter, callback): Promise<any> {
    clsNamespace.bindEmitter(emitter);
    return clsNamespace.runAndReturn(() => {
      this.setStore(traceData);
      return callback();
    });
  },
  setStore(store: object): TraceStore {
    Object.keys(store).forEach((key) => {
      this.set(key, store[key]);
    });
    return this;
  },
  set(key: string, value: any): TraceStore {
    clsNamespace.set(key, value);
    return this;
  },
  get(key: string): any {
    return clsNamespace.get(key);
  },
};

export default TraceStore;
