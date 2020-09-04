import { expect } from 'chai';

import { LocalOpentracer } from '../../local-opentracer';
import Tracer from '../../tracer';
import LocalOpentracerLoggerSpy from '../../local-opentracer/tests/helper/local-opentracer-logger-spy.test';

describe('Tracer', () => {
  let tracer;
  let spy;

  function someTrace({
    operationName = 'someFunction',
    originalFn = (): any => { },
    originalArgs = [],
    context = { someContext: 'context' },
    stacked = true,
    withArgsLogged = true,
    withResultLogged = true,
    spanOptions = {},
  }: {
    operationName?: string;
    originalFn?: any;
    originalArgs?: any[];
    context?: any;
    stacked?: boolean;
    withArgsLogged?: boolean;
    withResultLogged?: boolean;
    spanOptions?: any;
  }, tcr): any {
    return tcr.trace({
      operationName,
      context,
      withArgsLogged,
      withResultLogged,
      spanOptions,
    }, originalFn, originalArgs, stacked);
  }

  beforeEach(() => {
    tracer = new Tracer({ opentracer: new LocalOpentracer() });
    spy = new LocalOpentracerLoggerSpy();
  });

  it('traces function with result and log result default', async () => {
    const result = someTrace({
      originalFn: (): string => 'some result',
    }, tracer);
    expect(result).to.be.eq('some result');
    spy.isPrintedLast('.*someFunction .*finished.*' +
      'Tags:.*result:  some result.*');
  });

  it('traces function that throws an error', async () => {
    expect(() => someTrace({
      originalFn: (): void => { throw new Error('some error'); },
    }, tracer)).to.throw('some error');
    spy.shouldBePrintedSpanState('.*someFunction.*started');
    spy.shouldBePrintedSpanState('.*log: { event: error, name: Error, ' +
      'message: some error, stack: Error: some error.*');
    spy.shouldBePrintedSpanState('.*someFunction.*finished.*\n' +
      'No tags.');
    spy.verify();
  });

  it('traces function with result and result log set as true', async () => {
    const result = someTrace({
      withResultLogged: true,
    }, tracer);
    expect(result).to.be.undefined;
    expect(spy.isPrintedLast('.*someFunction.*finished.*\n' +
      '.*Tags:.*\n' +
      '.*result: undefined.*')).to.be.true;
  });

  it('traces function with result and result log set as false', async () => {
    const result = someTrace({
      withResultLogged: false,
    }, tracer);
    expect(result).to.be.undefined;
    expect(spy.isPrintedLast('.*someFunction.*finished.*\n' +
      'No tags.')).to.be.true;
  });

  it('traces function with arg and log arg default', async () => {
    const result = someTrace({
      originalFn: (arg): any => arg,
      originalArgs: ['some arg to result'],
    }, tracer);
    expect(result).to.be.eq('some arg to result');
    expect(spy.isPrintedLast('.*someFunction.*finished.*ms\n' +
      '.*Tags:.*\n' +
      '.*param.0:  some arg to result.*\n' +
      '.*result:  some arg to result.*')).to.be.true;
  });

  it('traces function with some args and log arg default', async () => {
    someTrace({
      originalFn: (someArg, anotherArg): any => ({ someArg, anotherArg }),
      originalArgs: ['some arg', 'another arg'],
    }, tracer);
    expect(spy.isPrintedLast('.*someFunction.*finished.*ms\n' +
      '.*Tags:.*\n' +
      '.*param.0:  some arg.*\n' +
      '.*param.1:  another arg.*\n')).to.be.true;
  });


  it('traces function with param and param log set as true', async () => {
    someTrace({
      originalFn: (arg): any => arg,
      originalArgs: ['some arg'],
      withArgsLogged: true,
    }, tracer);
    expect(spy.isPrintedLast('.*someFunction.*finished.*ms\n' +
      '.*Tags:.*\n' +
      '.*param.0:  some arg.*\n')).to.be.true;
  });

  it('traces function with param and param log set as false', async () => {
    someTrace({
      originalFn: (arg): any => arg,
      originalArgs: ['some arg'],
      withArgsLogged: false,
      withResultLogged: false,
    }, tracer);
    expect(spy.isPrintedLast('.*someFunction.*finished.*\n' +
      'No tags.')).to.be.true;
  });

  it('traces function with promise as result', async () => {
    const result = await someTrace({
      originalFn: async (): Promise<string> => 'some promise result',
    }, tracer);
    expect(result).to.be.eq('some promise result');
    spy.shouldBePrintedSpanState('.*someFunction.*started');
    spy.shouldBePrintedSpanState('.*someFunction.*finished.*\n' +
      '.*Tags:.*\n' +
      '.*result:  a promise is pending resolution.*');
    spy.shouldBePrintedSpanState('.*someFunction.promise.*started');
    spy.shouldBePrintedSpanState('.*someFunction.promise.*finished.*\n' +
      '.*Tags:.*\n' +
      '.*result:  some promise result.*');
    spy.verify();
  });

  it('traces function with promise with error as result', async () => {
    try {
      await someTrace({
        originalFn: async (): Promise<string> => { throw new Error('some error'); },
      }, tracer);
    } catch (e) {
      expect(e.message).to.be.eq('some error');
    }
    spy.shouldBePrintedSpanState('.*someFunction.*started');
    spy.shouldBePrintedSpanState('.*someFunction.*finished.*\n' +
      '.*Tags:.*\n' +
      '.*result:  a promise is pending resolution.*');
    spy.shouldBePrintedSpanState('.*someFunction.promise.*started');
    spy.shouldBePrintedSpanState('.*log: { event: error, name: Error, ' +
      'message: some error, stack: Error: some error.*');
    spy.shouldBePrintedSpanState('.*someFunction.promise.*finished.*\n' +
      'No tags.');
    spy.verify();
  });
});
