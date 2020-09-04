import restify from 'restify';
import request from 'supertest';
import { expect } from 'chai';

// eslint-disable-next-line import/no-duplicates
import { TraceStoreFactory as aTraceStoreFactory } from '../../trace-store-factory';
// eslint-disable-next-line import/no-duplicates
import { TraceStoreFactory as anotherTraceStoreFactory } from '../../trace-store-factory';

describe('TraceStoreFactory', () => {
  it('returns a singleton TraceStore', async () => {
    const { traceStore: aTraceStore } = aTraceStoreFactory;
    const { traceStore: anotherTraceStore } = anotherTraceStoreFactory;

    const app = restify.createServer();
    app.use((req, res, next): void => {
      aTraceStore.makeAvailableInRequest({ correlationId: 'some id' }, req, res, next);
    });
    app.get('/user', (_, res) => {
      const firstTraceStoreTraceId = aTraceStore.get('correlationId');
      const secondTraceStoreTraceId = anotherTraceStore.get('correlationId');
      res.send({ firstTraceStoreTraceId, secondTraceStoreTraceId });
    });
    const res = await request(app).get('/user');
    expect(res.status).to.be.eq(200);
    expect(res.body.firstTraceStoreTraceId).to.be.eq('some id');
    expect(res.body.firstTraceStoreTraceId).to.be.eq(res.body.secondTraceStoreTraceId);
  });
});
