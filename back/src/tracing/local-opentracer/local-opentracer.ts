import {
  Reference,
  REFERENCE_CHILD_OF,
  Span,
  SpanOptions,
  Tracer as Opentracer,
  FORMAT_TEXT_MAP,
  FORMAT_HTTP_HEADERS,
  SpanContext,
} from 'opentracing';
import { LocalOpentracerLogger } from './local-opentracer-logger';
import { LocalOpentracerSpan } from './local-opentracer-span';
import { LocalScopeManager } from './local-opentracer-scope-manager';
import { LocalOpentracerContext } from './local-opentracer-context';

export class LocalOpentracer extends Opentracer {
  private scopeManager: LocalScopeManager;
  private shortOutputEnabled: boolean;

  public constructor({ shortOutputEnabled = true } = {}) {
    super();
    this.shortOutputEnabled = shortOutputEnabled;
    this.scopeManager = new LocalScopeManager();
  }

  protected _inject(context: SpanContext, format: string, carrier: any): void {
    if (carrier && context &&
      (format === FORMAT_TEXT_MAP ||
      format === FORMAT_HTTP_HEADERS)) {
      // eslint-disable-next-line no-param-reassign
      carrier.StringValue = JSON.stringify({
        correlationId: context.toTraceId(),
        spanId: context.toSpanId(),
        baggageItems: {},
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected _extract(format: string, carrier: any): SpanContext | null {
    try {
      const context = JSON.parse(carrier);
      if (context.correlationId && context.spanId &&
        (format === FORMAT_TEXT_MAP ||
          format === FORMAT_HTTP_HEADERS)) {
        return new LocalOpentracerContext(context);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  protected _startSpan(name: string, fields: SpanOptions): LocalOpentracerSpan {
    const span: LocalOpentracerSpan = this._allocSpan();
    const references = fields.references || [];

    const parentSpan = fields.childOf
      ? fields.childOf
      : this.scopeManager.getActive();

    if (parentSpan) {
      references.push(new Reference(REFERENCE_CHILD_OF, parentSpan));
    }

    span.setOperationName(name);

    references.forEach((ref) => {
      span.addReference(ref);
    });

    this.scopeManager.activate(span);

    span.startStack = new Error().stack;
    this.report().outputSpanStart(span);
    return span;
  }

  public deactivate(span?: Span | null): void {
    function finishCollateralSpans(collateral): void {
      if (collateral && collateral.length > 0) {
        collateral.forEach((s: LocalOpentracerSpan) => {
          s.log({ event: 'complementary information', message: 'unexpected finish' });
          s.finishOnly();
        });
      }
    }

    const { collateral } = this.scopeManager.deactivate(span);
    finishCollateralSpans(collateral);
  }

  private _allocSpan(): LocalOpentracerSpan {
    return new LocalOpentracerSpan(this);
  }

  public clear(): void {
    this.scopeManager.clear();
  }

  public report(): LocalOpentracerLogger {
    return new LocalOpentracerLogger({
      shortOutputEnabled: this.shortOutputEnabled,
    });
  }
}

export default LocalOpentracer;
