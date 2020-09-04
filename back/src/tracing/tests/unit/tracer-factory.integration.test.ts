import restify, { RequestHandler } from 'restify';
import requestMock from 'supertest';
import { expect } from 'chai';

import { TracerFactory } from '../../tracer-factory';
import { TraceStoreFactory } from '../../trace-store-factory';
import LocalOpentracerLoggerSpy from '../../local-opentracer/tests/helper/local-opentracer-logger-spy.test';
import { requestTraceMiddleware } from '../../request-trace-middleware';

const environment = {
  enabled: true,
  shortOutputEnabled: true,
};

describe('Tracer Factory', () => {
  it('traces functions stacking spans', async () => {
    const app = restify.createServer();
    const spy = new LocalOpentracerLoggerSpy();

    const { trace } = TracerFactory.create(environment);

    function someFunctionInChain(): any {
      return trace({ component: 'SomeComponent', method: 'someFunctionInChain' },
        () => {
          const correlationId = TraceStoreFactory.traceStore.get('correlationId');
          return correlationId;
        })();
    }

    const someControllerFunction = trace({ component: 'SomeComponent', method: 'SomeController' },
      (_, res): void => {
        const correlationId = someFunctionInChain();
        res.send({ correlationId });
      }) as RequestHandler;

    const config = { enabled: true, shortOutputEnabled: true };
    app.use(requestTraceMiddleware(config));
    app.get('/some-endpoint', someControllerFunction);
    app.get('/another-endpoint', someControllerFunction);
    const res = await requestMock(app).get('/some-endpoint');

    expect(res.status).to.be.eq(200);
    expect(res.body.correlationId).to.not.be.undefined;
    spy.shouldBePrintedSpanState('0 >> GET:/some-endpoint - started');
    spy.shouldBePrintedSpanState('1 >>>> SomeComponent.SomeController - started');
    spy.shouldBePrintedSpanState('2 >>>>>> SomeComponent.someFunctionInChain - started');
    spy.shouldBePrintedSpanState('<<<<<<<< SomeComponent.someFunctionInChain - finished in .*ms\n' +
      '.*Tags: \n   \\[ result:  .*  \\]');
    spy.shouldBePrintedSpanState(
      '<<<<<< SomeComponent.SomeController - finished in .*ms\n' +
      '.*Tags:.*');
    spy.shouldBePrintedSpanState(
      '<<<< GET:/some-endpoint - finished in .*ms\n' +
      'No tags.');
    spy.verify();
  });

  it('trace functions without stacking spans', () => {
    const spy = new LocalOpentracerLoggerSpy();

    const { trace } = TracerFactory.create(environment);

    const anotherFunctionInChain = trace({ component: 'SomeClass', method: 'anotherFunctionInChain' },
      (): string => 'some return');
    function someFunctionInChain(): any {
      return trace({ component: 'SomeClass', method: 'someFunctionInChain' },
        () => anotherFunctionInChain())();
    }

    const result = someFunctionInChain();
    expect(result).to.be.eq('some return');
    spy.shouldBePrintedSpanState('.*' +
      '0 >> SomeClass.someFunctionInChain - started');
    spy.shouldBePrintedSpanState('.*' +
      '0 >> SomeClass.anotherFunctionInChain');
    spy.shouldBePrintedSpanState('<<<< SomeClass.anotherFunctionInChain - finished in .*ms\n' +
      '.*Tags: \n   \\[ result:  some return  \\]');
    spy.shouldBePrintedSpanState('<<<< SomeClass.someFunctionInChain - finished in .*ms\n' +
      '.*Tags: \n   \\[ result:  some return  \\]');
    spy.verify();
  });
});
