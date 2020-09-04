import { Span } from 'opentracing';
import sinon, { SinonSpy } from 'sinon';
import { expect } from 'chai';
import { LocalOpentracerLogger } from '../../local-opentracer-logger';
import { LocalOpentracerSpan } from '../../local-opentracer-span';

function isMessage(spanOrMessage: Span | string): boolean {
  return (typeof spanOrMessage === 'string');
}

function isSpan(spanOrMessage: Span | string): boolean {
  return !isMessage(spanOrMessage);
}

function isRegexMatch(logged, regex): boolean {
  if (logged === regex) {
    return true;
  }
  const match = logged.match(regex);
  return match !== null && match[0].trim().length > 0;
}

function isSpanStateMatch(
  logger,
  logged,
  span: LocalOpentracerSpan,
): boolean {
  return logged === logger.getSpanStartLog(span as LocalOpentracerSpan) ||
    logged === logger.getSpanFinishLog(span as LocalOpentracerSpan);
}


class LocalOpentracerLoggerSpy {
  private expected: string[];
  private logged: string[];
  private logger: LocalOpentracerLogger;

  public constructor({ shortOutputEnabled = true } = {}) {
    this.expected = [];
    this.logged = [];
    this.logger = new LocalOpentracerLogger({ shortOutputEnabled });
    this.fakeIt();
  }

  private fakeIt(): SinonSpy {
    sinon.restore();
    const sinonFake = sinon.fake(({ message }) => this.logged.push(message));
    sinon.replace(LocalOpentracerLogger, 'output', sinonFake);
    return sinonFake;
  }

  public shouldBePrintedSpanState(spanOrMessage: Span | string): void {
    let message = spanOrMessage as string;
    if (isSpan(spanOrMessage)) {
      // eslint-disable-next-line no-underscore-dangle
      const isStart = (spanOrMessage as LocalOpentracerSpan)._finishMs <= 0;
      if (isStart) {
        message = this.logger.getSpanStartLog(spanOrMessage as LocalOpentracerSpan);
      }
      if (!isStart) {
        message = this.logger.getSpanFinishLog(spanOrMessage as LocalOpentracerSpan);
      }
    }

    this.expected.push(message);
  }

  public shouldBePrintedLog(message: string): void {
    this.expected.push(message);
  }

  public verify(): void {
    // eslint-disable-next-line no-console
    this.logged.forEach(l => console.log(l));
    expect(
      this.logged.length === this.expected.length &&
      this.logged.every((v, k) => isRegexMatch(v, this.expected[k])),
    ).to.be.true;
    sinon.restore();
  }

  private isLogEmpty(): boolean {
    return this.logged.length === 0;
  }

  private getLastLogged(): string | null {
    if (this.isLogEmpty()) {
      return null;
    }

    return this.logged[this.logged.length - 1];
  }

  public isPrintedLast(spanOrMessage: Span | string): boolean {
    if (this.isLogEmpty()) {
      return false;
    }
    const lastLogged = this.getLastLogged();
    return (isMessage(spanOrMessage) &&
      isRegexMatch(lastLogged, spanOrMessage)) ||

      (isSpan(spanOrMessage) &&
        isSpanStateMatch(this.logger, lastLogged, spanOrMessage as LocalOpentracerSpan));
  }
}

export default LocalOpentracerLoggerSpy;
