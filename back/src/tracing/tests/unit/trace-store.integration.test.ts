import restify from 'restify';
import request from 'supertest';
import { expect } from 'chai';

import traceStore from '../../trace-store';

describe('TraceStore', () => {
  it('stores and retrieves trace data up in the functions chain', async () => {
    const app = restify.createServer();
    const tracingMiddleware = (req, res, next): void => {
      traceStore.makeAvailableInRequest({ correlationId: 'some id' }, req, res, next);
    };
    const someFunctionInChain = (): string => traceStore.get('correlationId') as string;
    const someControllerFunction = (_, res): void => {
      const correlationId = someFunctionInChain();
      res.send({ correlationId });
    };
    app.use(tracingMiddleware);
    app.get('/some-endpoint', someControllerFunction);
    const res = await request(app).get('/some-endpoint');
    expect(res.body.correlationId).to.be.eq('some id');
  });

  it('makes trace store unique in each request', async () => {
    const app = restify.createServer();
    const tracingMiddleware = (req, res, next): void => {
      traceStore.makeAvailableInRequest({ correlationId: 'some id' }, req, res, next);
    };
    const someFunctionInChain = (): string => traceStore.get('correlationId') as string;
    const someControllerFunctionThatKeepsInitialTraceId = (_, res): void => {
      const correlationId = someFunctionInChain();
      res.send({ correlationId });
    };
    const someControllerFunctionThatChangesTraceId = (_, res): void => {
      traceStore.set('correlationId', 'different id');
      const correlationId = someFunctionInChain();
      res.send({ correlationId });
    };
    app.use(tracingMiddleware);
    app.get('/some-endpoint-that-changes-trace-id', someControllerFunctionThatChangesTraceId);
    app.get('/another-endpoint-that-keeps-initial-trace-id', someControllerFunctionThatKeepsInitialTraceId);
    const someRes = await request(app).get('/some-endpoint-that-changes-trace-id');
    const anotherRes = await request(app).get('/another-endpoint-that-keeps-initial-trace-id');
    expect(someRes.body.correlationId).to.be.eq('different id');
    expect(anotherRes.body.correlationId).to.be.eq('some id');
  });
});
