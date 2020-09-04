import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction';
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request';
import {ZipkinExporter} from "@opentelemetry/exporter-zipkin";

// Supports only synchronous operations
const provider = new WebTracerProvider({
    plugins: [
        new DocumentLoad(),
        new UserInteractionPlugin(),
        new XMLHttpRequestPlugin({
            // this is webpack  auto reload - we can ignore it
            ignoreUrls: [/localhost:8091\/sockjs-node/],
            propagateTraceHeaderCorsUrls: '*',
        }),
    ]
});

provider.addSpanProcessor(new SimpleSpanProcessor(
    new ZipkinExporter({
        serviceName: "front-ats",
    })
    // Use `new ConsoleSpanExporter()` to log on console
));
provider.register();


// Supports asynchronous operations
const providerWithZone = new WebTracerProvider({
    plugins: [
        new DocumentLoad()
    ]
});
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(
    new ZipkinExporter({
        serviceName: "front-ats",
    })
    // Use `new ConsoleSpanExporter()` to log on console
));

providerWithZone.register({
    contextManager: new ZoneContextManager().enable(),
});


// All set
console.log("Tracing initialized");
