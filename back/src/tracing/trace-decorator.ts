import { TracerFactory } from './tracer-factory';
import { StartSpanOptions } from './tracer';

export default function trace(options: StartSpanOptions = {}): Function {
  const {
    operationName,
    component,
    method,
    withResultLogged,
    withArgsLogged,
    withSpanInArgs,
    spanOptions,
  } = options;
  return (target: object, name: string, descriptor: PropertyDescriptor): PropertyDescriptor => ({
    ...descriptor,
    value(...args) {
      return TracerFactory
        .create()
        .trace({
          operationName,
          component: component || (target && target.constructor && target.constructor.name),
          method: method || name,
          spanOptions,
          context: target,
          withResultLogged,
          withArgsLogged,
          withSpanInArgs,
        }, (...subargs) => descriptor.value.apply(this, subargs))(...args);
    },
  });
}
