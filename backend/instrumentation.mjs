const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // Points to the OTel Collector service deployed in your Minikube cluster
    url: 'grpc://otel-collector-opentelemetry-collector:4317', 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'freelance-backend',
});

sdk.start();