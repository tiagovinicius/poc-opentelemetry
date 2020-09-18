import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';

// Supports asynchronous operations
const provider = new WebTracerProvider({
    plugins: [
        new DocumentLoad()
    ]
});

provider.addSpanProcessor(new SimpleSpanProcessor(
    new ConsoleSpanExporter(),
));

provider.addSpanProcessor(new SimpleSpanProcessor(
    new CollectorTraceExporter({
        serviceName: 'front-ats'
    }),
));

provider.register({
    contextManager: new ZoneContextManager().enable(),
});


// All set
console.log("Tracing initialized");
