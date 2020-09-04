import { LocalOpentracer } from '../../local-opentracer';
import apiCompatibilityChecks from './opentracing-api-compability-check.unit.test';

describe('Local Opentracer Compatibility Check ', () => {
  it('is compatible when short output enabled', () => {
    apiCompatibilityChecks(
      () => new LocalOpentracer({ shortOutputEnabled: false }),
      { skipInjectExtractChecks: true, skipBaggageChecks: true });
  });

  it('is compatible when short output disabled', () => {
    apiCompatibilityChecks(
      () => new LocalOpentracer({ shortOutputEnabled: true }),
      { skipInjectExtractChecks: true, skipBaggageChecks: true });
  });
});

