import { logger } from '@gupy/logging';
import { LocalOpentracerSpan } from './local-opentracer-span';

function stringfy(json: object, fallbackString: string): string {
  try {
    return JSON.stringify(json);
  } catch (e) {
    return JSON.stringify({ gracefulDegradation: fallbackString });
  }
}

function stringifyAndSanitize(text: unknown): string {
  return JSON.stringify(text)
    .split('",')
    .join(',')
    .split('":')
    .join(':')
    .split('"')
    .join(' ');
}

function getTagsShortOutput(span: LocalOpentracerSpan): string {
  const tags = span.tags();
  const tagsLog = Object.keys(tags).reduce((partialTagsLog, key) => {
    let value;
    try {
      value = tags[key] ? stringifyAndSanitize(tags[key]) : value;
    } catch (e) {
      value = `Unable to explicit value for ${tags[key]}`;
    }
    return `${partialTagsLog} \n   [ ${key}: ${value} ]`;
  }, '');
  if (tagsLog.length > 0) {
    return `  Tags:${tagsLog}`;
  }
  return 'No tags.';
}

function getTagsNormalOutput(span: LocalOpentracerSpan): object {
  return span.tags();
}

function getStartIndentation(level: number): string {
  const limit = 10;
  return `${level} ${('>>').repeat((level + 1) <= limit ? (level + 1) : limit)}`;
}

function getFinishIndentation(level: number): string {
  return `${'<'.repeat(level.toString().length)}<${('<<').repeat(level + 1)}`;
}

function getTimestampFromSpan(span: LocalOpentracerSpan): number {
  // eslint-disable-next-line no-underscore-dangle
  return span._finishMs > 0 ? span._finishMs : span._startMs;
}

function getOperationNameShortOutput(name: string): string {
  try {
    const {
      operationName,
      isPromise,
      component,
      method,
      url,
      requestMethod,
      consumer,
    } = JSON.parse(name);

    if (operationName) {
      return isPromise ? `${operationName}.promise` : operationName;
    }

    if (component || method) {
      return isPromise ? `${component}.${method}.promise` : `${component}.${method}`;
    }

    if (url && requestMethod) {
      return `${requestMethod}:${url}`;
    }

    if (url && consumer) {
      return `${consumer}:${url}`;
    }
  } catch (e) {
    return name;
  }
  return 'Unnamed component and method';
}

function getOperationNameNormalOutput(name: string): object | string {
  try {
    const {
      operationName,
      isPromise,
      component,
      method,
      url,
      requestMethod,
      consumer,
    } = JSON.parse(name);

    if (operationName) {
      return isPromise ? { operationName, isPromise } : operationName;
    }

    if (component || method) {
      return isPromise ? { component, method, isPromise } : { component, method };
    }

    if (url && requestMethod) {
      return { url, requestMethod };
    }

    if (url && consumer) {
      return { url, consumer };
    }
  } catch (e) {
    return name;
  }
  return { operationName: 'Unnamed component and method' };
}

function getStartOperation(): string {
  return 'started';
}

function getFinishOperation(span: LocalOpentracerSpan): string {
  return `finished in ${span.durationMs()}ms`;
}

function getStartedSpanShortOutput({ indentation, operationName, operation }): string {
  return `${indentation} ${getOperationNameShortOutput(operationName)} - ${operation}`;
}

function getStartedSpanNormalOutput({
  operationName,
  operation,
  transactionId,
  correlationId,
  spanId,
}):
  object {
  return {
    operationName: getOperationNameNormalOutput(operationName),
    status: operation,
    transactionId,
    correlationId,
    spanId,
  };
}

function getFinishedSpanShortOutput({ indentation, operationName, operation, tagsLog }): string {
  return `${indentation} ${getOperationNameShortOutput(operationName)} - ${operation}\n${tagsLog}`;
}

function getFinishedSpanNormalOutput({
  operationName,
  operation,
  tagsLog,
  transactionId,
  correlationId,
  spanId,
}): object {
  return {
    operationName: getOperationNameNormalOutput(operationName),
    status: operation,
    tags: tagsLog,
    transactionId,
    correlationId,
    spanId,
  };
}

export function getSpanStartLog(span: LocalOpentracerSpan, shortOutputEnabled: boolean): string {
  const parts = {
    operationName: span.operationName(),
    correlationId: span.correlationId(),
    transactionId: span.transactionId(),
    spanId: span.uuid(),
    operation: getStartOperation(),
    indentation: getStartIndentation(span.printLevel()),
  };

  return shortOutputEnabled
    ? getStartedSpanShortOutput(parts)
    : stringfy(getStartedSpanNormalOutput(parts), getStartedSpanShortOutput(parts));
}

export function getSpanFinishLog(span: LocalOpentracerSpan, shortOutputEnabled: boolean): string {
  const parts = {
    operationName: span.operationName(),
    operation: getFinishOperation(span),
    indentation: getFinishIndentation(span.printLevel()),
    correlationId: span.correlationId(),
    transactionId: span.transactionId(),
    spanId: span.uuid(),
    tagsLog: shortOutputEnabled
      ? getTagsShortOutput(span)
      : getTagsNormalOutput(span),
  };

  return shortOutputEnabled
    ? getFinishedSpanShortOutput(parts)
    : stringfy(getFinishedSpanNormalOutput(parts), getFinishedSpanShortOutput(parts));
}

function getEventLogNormalOutput({
  event,
  logId,
  operationName,
  correlationId,
  transactionId,
  spanId,
}: {
  event: unknown;
  logId: number;
  operationName: string;
  correlationId: string;
  transactionId: string;
  spanId: string;
},
): object {
  return {
    operationName: getOperationNameNormalOutput(operationName),
    [`log.${logId}`]: event,
    correlationId,
    transactionId,
    spanId,
  };
}

function getEventLogShortOutput(event: unknown): string {
  let value;
  try {
    value = stringifyAndSanitize(event);
  } catch (e) {
    value = `Unable to explicit value for ${event}`;
  }
  return `[ log: ${value} ]`;
}

function getEventLog({
  event,
  logId = 0,
  shortOutputEnabled,
  operationName,
  correlationId,
  transactionId,
  spanId,
}:
{
  event: unknown;
  logId: number;
  shortOutputEnabled: boolean;
  operationName: string;
  correlationId: string;
  transactionId: string;
  spanId: string;
}): string {
  return shortOutputEnabled
    ? getEventLogShortOutput(event)
    : stringfy(
      getEventLogNormalOutput({
        event,
        logId,
        operationName,
        correlationId,
        transactionId,
        spanId,
      }),
      getEventLogShortOutput(event),
    );
}

export class LocalOpentracerLogger {
  private shortOutputEnabled: boolean;

  public constructor({ shortOutputEnabled = true }: { shortOutputEnabled?: boolean }) {
    this.shortOutputEnabled = shortOutputEnabled;
  }

  public static output({ message, isError = false, timestamp }:
  { message: string; isError?: boolean; timestamp?: number }): void {
    logger.log(isError ? 'error' : 'info', message, timestamp ? { timestamp } : null);
  }

  public getSpanStartLog(span): string {
    return getSpanStartLog(span, this.shortOutputEnabled);
  }

  public outputSpanStart(span: LocalOpentracerSpan): void {
    LocalOpentracerLogger.output({
      message: getSpanStartLog(span, this.shortOutputEnabled),
      timestamp: getTimestampFromSpan(span),
    });
  }

  public getSpanFinishLog(span): string {
    return getSpanFinishLog(span, this.shortOutputEnabled);
  }

  public outputSpanFinish(span: LocalOpentracerSpan): void {
    LocalOpentracerLogger.output({
      message: getSpanFinishLog(span, this.shortOutputEnabled),
      timestamp: getTimestampFromSpan(span),
    });
  }

  public outputEventLog({
    event,
    logId,
    span,
    timestamp,
  }: {
    event: { [key: string]: any };
    logId: number;
    span: LocalOpentracerSpan;
    timestamp?: number;
  }): void {
    const operationName = span.operationName();
    const correlationId = span.correlationId();
    const transactionId = span.transactionId();
    const spanId = span.uuid();
    LocalOpentracerLogger.output({
      message: getEventLog({
        event,
        logId,
        shortOutputEnabled: this.shortOutputEnabled,
        operationName,
        correlationId,
        transactionId,
        spanId,
      }),
      timestamp,
      isError: event.event && event.event === 'error',
    });
  }
}

export default LocalOpentracerLogger;
