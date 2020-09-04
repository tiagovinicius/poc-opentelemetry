const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");

const provider = new NodeTracerProvider({
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

// All set
console.log("Tracing initialized");