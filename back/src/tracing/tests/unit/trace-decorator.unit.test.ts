import { expect } from 'chai';
import { Span } from 'opentracing';
import LocalOpentracerLoggerSpy from '../../local-opentracer/tests/helper/local-opentracer-logger-spy.test';
import trace from '../../trace-decorator';

const environment = {
  enabled: true,
  shortOutputEnabled: true,
};

describe.skip('Trace Decorator', () => {
  it('stores and retrieves trace data up in the functions chain', () => {
    const spy = new LocalOpentracerLoggerSpy();
    class SomeClass {
      @trace({ withSpanInArgs: true, ...environment })
      // eslint-disable-next-line class-methods-use-this
      public someFunctionInChain(span?: Span): string {
        if (span) span.log({ message: 'logging at someFunctionInChain' });
        return this.anotherFunctionInChain();
      }

      @trace({
        component: 'SomeClass',
        method: 'anotherFunctionInChain',
        withSpanInArgs: true,
        ...environment,
      })
      // eslint-disable-next-line class-methods-use-this
      public anotherFunctionInChain(span?: Span): string {
        if (span) span.log({ message: 'logging at anotherFunctionInChain' });
        return 'some return';
      }
    }

    const result = (new SomeClass()).someFunctionInChain();
    expect(result).to.be.eq('some return');

    spy.shouldBePrintedSpanState('0 >> SomeClass.someFunctionInChain - started');
    spy.shouldBePrintedLog('[ log: { message: logging at someFunctionInChain } ]');
    spy.shouldBePrintedSpanState('1 >>>> SomeClass.anotherFunctionInChain - started');
    spy.shouldBePrintedLog('[ log: { message: logging at anotherFunctionInChain } ]');
    spy.shouldBePrintedSpanState(
      '<<<< SomeClass.anotherFunctionInChain - finished in .*ms\n' +
      '.*Tags: \n   \\[ result:  some return  \\]');
    spy.shouldBePrintedSpanState(
      '<<<< SomeClass.someFunctionInChain - finished in .*ms\n' +
      '.*Tags: \n   \\[ result:  some return  \\]');
    spy.verify();
  });
});
