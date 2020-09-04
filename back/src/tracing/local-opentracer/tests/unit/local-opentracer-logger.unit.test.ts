import { expect } from 'chai';
import { LocalOpentracer } from '../../local-opentracer';
import LocalOpentracerLoggerSpy from '../helper/local-opentracer-logger-spy.test';

describe('Local Opentracer Logger', () => {
  describe('Short Output', () => {
    let spy;
    let tracer;
    let span;

    beforeEach(() => {
      spy = new LocalOpentracerLoggerSpy();
      tracer = new LocalOpentracer();
      span = tracer.startSpan('span');
    });

    it('prints a not finished span', () => {
      spy.shouldBePrintedSpanState(span);
      spy.verify();
    });

    it('prints a finished span', () => {
      spy.shouldBePrintedSpanState(span);
      expect(spy.isPrintedLast('0 >> span - started')).to.be.true;
      span.log({ event: 'health check', message: 'success' });
      spy.shouldBePrintedLog('.*log: { event: health check, message: success }.*');
      span.finish();
      spy.shouldBePrintedSpanState(span);
      expect(spy.isPrintedLast(
        '.*span - finished in .*ms\n' +
        '.*No tags.',
      )).to.be.true;
      spy.verify();
    });

    it('prints a span with tags', () => {
      span.setTag('alpha', '200');
      span.setTag('beta', '50');
      span.finish();
      expect(spy.isPrintedLast(
        '<<<< span - finished in .*ms\n' +
        '.*Tags: \n   \\[ alpha:  200  \\] \n   \\[ beta:  50  \\]',
      )).to.be.true;
      expect(spy.isPrintedLast(span)).to.be.true;
    });
  });


  describe('Normal Output', () => {
    let spy;
    let tracer;
    let span;

    beforeEach(() => {
      spy = new LocalOpentracerLoggerSpy({ shortOutputEnabled: false });
      tracer = new LocalOpentracer({ shortOutputEnabled: false });
      span = tracer.startSpan('span');
    });

    it('prints a not finished span', () => {
      spy.shouldBePrintedSpanState(span);
      spy.verify();
    });

    it('prints a finished span', () => {
      spy.shouldBePrintedSpanState(span);
      expect(spy.isPrintedLast('{"operationName":"span","status":"started","transactionId":".*","correlationId":".*"}')).to.be.true;
      span.log({ event: 'health check', message: 'success' });
      spy.shouldBePrintedLog('{"operationName":"span","log.0":{"event":"health check","message":"success"},"correlationId":".*","transactionId":".*"}');
      span.finish();
      spy.shouldBePrintedSpanState(span);
      expect(spy.isPrintedLast(
        '{"operationName":"span","status":"finished in .*ms","tags":{},"transactionId":".*","correlationId":".*"}',
      )).to.be.true;
      spy.verify();
    });

    it('prints a span with tags', () => {
      span.setTag('alpha', '200');
      span.setTag('beta', '50');
      span.finish();
      expect(spy.isPrintedLast(
        '{"operationName":"span","status":"finished in .*ms","tags":{"alpha":"200","beta":"50"},"transactionId":".*","correlationId":".*"}',
      )).to.be.true;
      expect(spy.isPrintedLast(span)).to.be.true;
    });
  });
});

