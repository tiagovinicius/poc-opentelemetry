import * as opentracing from 'opentracing';

export class LocalOpentracerContext extends opentracing.SpanContext {
  private _attributes: { [key: string]: string };
  private _printLevel: number;

  public constructor(attributes: { [key: string]: string }, printLevel = 0) {
    super();
    this._attributes = attributes;
    this._printLevel = printLevel;
  }

  public printLevel(): number {
    return this._printLevel;
  }

  public toTraceId(): string {
    return this._attributes.correlationId;
  }

  public toSpanId(): string {
    return this._attributes.spanId;
  }

  public toCorrelationId(): string {
    return this._attributes.correlationId;
  }

  public toTransactionId(): string {
    return this._attributes.transactionId;
  }
}
