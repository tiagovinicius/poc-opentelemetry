import { LogLevel } from "@opentelemetry/core";
import { NodeTracerProvider } from "@opentelemetry/node";
import { ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/tracing";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

const provider: NodeTracerProvider = new NodeTracerProvider({
    logLevel: LogLevel.ERROR
});

provider.register();

provider.addSpanProcessor(
    new SimpleSpanProcessor(
        new ZipkinExporter({
            serviceName: "api-darthvader",
        })
    )
);

provider.addSpanProcessor(
    new SimpleSpanProcessor(
        new ConsoleSpanExporter()
    )
);