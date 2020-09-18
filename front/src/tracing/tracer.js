function getOperationName({
  operationName,
  component,
  method,
  isPromise = false,
  url,
  requestMethod,
  consumer,
}) {
  if (operationName) {
    return `${operationName}${isPromise ? '.promise' : ''}`;
  }

  if (component || method) {
    return `${component || 'unknown'}.${method || 'unknown'}${isPromise ? '.promise' : ''}`;
  }

  if (url && requestMethod) {
    return `${requestMethod}//${url}`;
  }


  if (url && consumer) {
    return `${url}/${consumer}`;
  }

  return 'unknown';
}

function isFunction(fn) {
  return fn && typeof fn === 'function';
}

function isPromise(fn) {
  return fn && typeof fn.then === 'function';
}

export class Tracer {
  otlTracer;

  constructor(otlTracer) {
    if (!otlTracer) {
      throw new Error('A Opentelemetry compatible Tracer is needed.');
    }
    this.otlTracer = otlTracer;
  }

  tracePromise(promise, nameOptions, span) {
    return promise
      .then((res) => {
        const name = getOperationName({ ...nameOptions, isPromise: true });
        this.otlTracer.startSpan(name, { parent: span })
          .setAttribute(`${name}.result`, res)
          .end();
        return res;
      })
      .catch((err) => {
        const name = getOperationName({ ...nameOptions, isPromise: true });
        this.otlTracer.startSpan(name, { parent: span })
          .addEvent(`${name}.exception`, { 'exception.type': err.name, 'exception.message': err.message, 'exception.stacktrace': err.stack, 'error.object': err })
          .end();
        throw err;
      });
  }

  trace({
    operationName,
    component,
    method,
    url,
    requestMethod,
    context,
    withArgsLogged = true,
    withResultLogged = true,
    withSpanInArgs = false,
    spanOptions,
  },
  originalFn,
  originalArgs) {
    const nameOptions = { operationName, component, method, url, requestMethod };

    const name = getOperationName(nameOptions);
    if (!isFunction(originalFn)) {
      throw new Error(`Tried to trace ${name}, but it isn't a method/function`);
    }

    const span = this.otlTracer.startSpan(name, spanOptions);

    if (withArgsLogged) {
      originalArgs.forEach(
        (arg, index) => span.setAttribute(`${name}.param.${index}`, arg));
    }

    try {
      const result = originalFn.apply(
        context,
        withSpanInArgs ? [...originalArgs, span] : originalArgs,
      );

      if (isPromise(result)) {
        if (withResultLogged) {
          span.setAttribute(`${name}.result`, 'a promise is pending resolution.');
        }
        // return this.tracePromise(result, nameOptions, span);
      }

      if (withResultLogged) {
        span.setAttribute(`${name}.result`, result);
      }
      return result;
    } catch (e) {
      span.addEvent(`${name}.exception`, { 'exception.type': e.name, 'exception.message': e.message, 'exception.stacktrace': e.stack, 'error.object': e });
      throw e;
    } finally {
      span.end();
    }
  }

  startSpan(options) {
    const name = getOperationName(options);
    return this.otlTracer.startSpan(name, options);
  }
}
