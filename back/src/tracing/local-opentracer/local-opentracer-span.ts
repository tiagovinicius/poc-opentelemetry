import { Span, Reference, REFERENCE_CHILD_OF, Tracer } from 'opentracing';
import uuid from 'uuid';
import { LocalOpentracerContext } from './local-opentracer-context';
import { LocalOpentracer } from './local-opentracer';

interface Log {
  fields: { [key: string]: any };
  timestamp?: number;
}

export interface DebugInfo {
  uuid: string;
  operation: string;
  millis: [number, number, number];
  tags?: { [key: string]: any };
}

/**
 * OpenTracing Span implementation designed for use in unit tests.
 */
export class LocalOpentracerSpan extends Span {
  private _operationName: string;
  private _transactionId: string;
  private _correlationId: string;
  private _tags: { [key: string]: any };
  private _logs: Log[];
  public _finishMs: number;
  private _localTracer: LocalOpentracer;
  private _uuid: string;
  public _startMs: number;
  public startStack?: string;
  private _printLevel: number;

  protected _context(): LocalOpentracerContext {
    return new LocalOpentracerContext({
      correlationId: this._correlationId,
      transactionId: this._transactionId,
      spanId: this._uuid,
    }, this.printLevel());
  }

  protected _setOperationName(name: string): void {
    this._operationName = name;
  }

  private _setPrintLevel(context: LocalOpentracerContext): void {
    if (context && (context.printLevel() !== undefined || context.printLevel() !== null)) {
      this._printLevel = context.printLevel() + 1;
    }
  }

  protected _addTags(set: { [key: string]: any }): void {
    const keys = Object.keys(set);
    keys.forEach((key) => {
      this._tags[key] = set[key];
    });
  }

  protected _log(fields: { [key: string]: any }, timestamp?: number): void {
    this._logs.push({
      fields,
      timestamp,
    });

    this._localTracer.report()
      .outputEventLog({
        event: fields,
        logId: this._logs.length - 1,
        span: this,
        timestamp,
      });
  }

  protected _finish(finishTime?: number): void {
    this.finishAndDeactivate(finishTime);
  }

  private finishAndDeactivate(finishTime?: number): void {
    this.finishOnly(finishTime);
    this._localTracer.deactivate(this);
  }

  public finishOnly(finishTime?: number): void {
    this._finishMs = finishTime || Date.now();
    this._localTracer.report().outputSpanFinish(this);
  }

  public constructor(tracer: LocalOpentracer) {
    super();
    this._localTracer = tracer;
    this._printLevel = 0;
    this._uuid = this._generateUUID();
    this._correlationId = this._uuid;
    this._transactionId = this._uuid;
    this._startMs = Date.now();
    this._finishMs = 0;
    this._operationName = '';
    this._tags = {};
    this._logs = [];
  }

  public uuid(): string {
    return this._uuid;
  }

  public operationName(): string {
    return this._operationName;
  }

  public printLevel(): number {
    return this._printLevel;
  }

  public durationMs(): number {
    return this._finishMs - this._startMs;
  }

  public tags(): { [key: string]: any } {
    return this._tags;
  }

  public tracer(): Tracer {
    return this._localTracer;
  }

  public correlationId(): string {
    return this._correlationId;
  }

  public transactionId(): string {
    return this._transactionId;
  }

  private _generateUUID(): string {
    return uuid();
  }

  public addReference(ref: Reference): void {
    if (ref.type() === REFERENCE_CHILD_OF) {
      const context = ref.referencedContext() as LocalOpentracerContext;
      this._setPrintLevel(context);
      this._correlationId = context.toCorrelationId();
      this._transactionId = context.toTransactionId();
    }
  }

  /**
   * Returns a simplified object better for console.log()'ing.
   */
  public debug(): DebugInfo {
    const obj: DebugInfo = {
      uuid: this._uuid,
      operation: this._operationName,
      millis: [this._finishMs - this._startMs, this._startMs, this._finishMs],
    };
    if (Object.keys(this._tags).length) {
      obj.tags = this._tags;
    }
    return obj;
  }
}

export default LocalOpentracerSpan;
