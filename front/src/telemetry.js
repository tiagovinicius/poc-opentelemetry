import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction';

// Supports asynchronous operations
const provider = new WebTracerProvider({
    plugins: [
        new DocumentLoad(),
        new UserInteractionPlugin(),
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
