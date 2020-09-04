import restify from 'restify';
import request from 'supertest';
import { expect } from 'chai';
import { requestTraceMiddleware } from '../request-trace-middleware';
import { TraceStoreFactory } from '../trace-store-factory';

describe('Request Trace Middleware', () => {
  it('stores and retrieves unique trace data in each request', async () => {
    const config = { enabled: true, shortOutputEnabled: true };
    const { traceStore } = TraceStoreFactory;
    const app = restify.createServer();
    const someControllerFunction = (_, res): void => {
      const correlationId = traceStore.get('correlationId');
      res.send({ correlationId });
    };
    app.use(requestTraceMiddleware(config));
    app.get('/some-endpoint', someControllerFunction);
    const res = await request(app).get('/some-endpoint');
    expect(res.status).to.be.eq(200);
    expect(res.body.correlationId).to.not.be.undefined;
  });
});
