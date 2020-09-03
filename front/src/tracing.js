import { SimpleSpanProcessor } from '@opentelemetry/tracing';
// import { ConsoleSpanExporter } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction';
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request';
import {ZipkinExporter} from "@opentelemetry/exporter-zipkin";

// Minimum required setup - supports only synchronous operations
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
        // If you are running your tracing backend on another host,
        // you can point to it using the `url` parameter of the
        // exporter config.
    })
    // new ConsoleSpanExporter()
));
provider.register();

const providerWithZone = new WebTracerProvider({
    plugins: [
        new DocumentLoad()
    ]
});
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(
    new ZipkinExporter({
        serviceName: "front-ats",
        // If you are running your tracing backend on another host,
        // you can point to it using the `url` parameter of the
        // exporter config.
    })
    // new ConsoleSpanExporter()
));

// Changing default contextManager to use ZoneContextManager - supports asynchronous operations
providerWithZone.register({
    contextManager: new ZoneContextManager().enable(),
});

console.log("Tracing initialized");