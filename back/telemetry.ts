import { LogLevel } from "@opentelemetry/core";
import { NodeTracerProvider } from "@opentelemetry/node";
import { ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/tracing";
import {CollectorTraceExporter} from "@opentelemetry/exporter-collector";

const provider: NodeTracerProvider = new NodeTracerProvider({
    logLevel: LogLevel.ERROR
});

provider.addSpanProcessor(
    new SimpleSpanProcessor(
        new CollectorTraceExporter({
            serviceName: 'api-darthvader'
        }),
    )
);

provider.addSpanProcessor(
    new SimpleSpanProcessor(
        new ConsoleSpanExporter()
    )
);

provider.register();