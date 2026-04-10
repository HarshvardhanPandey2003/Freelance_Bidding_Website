#!/bin/bash

# Exit on any error
set -e

NAMESPACE="freelance-hub"

echo "🧹 Pruning old Helm secrets if they are stuck..."
# (Helm handles this automatically with upgrade --install)

echo "📦 Adding/Updating Repos..."
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update

# 1. Loki (Logs Storage)
echo "🔥 Syncing Loki..."
helm upgrade --install loki grafana/loki \
  --namespace $NAMESPACE --create-namespace \
  --set deploymentMode=SingleBinary \
  --set loki.auth_enabled=false \
  --set loki.commonConfig.replication_factor=1 \
  --set loki.storage.type=filesystem \
  --set singleBinary.replicas=1 \
  --set read.replicas=0 \
  --set write.replicas=0 \
  --set backend.replicas=0 \
  --set loki.useTestSchema=true \
  --set chunksCache.enabled=false

# 2. Tempo (Traces Storage)
echo "⏱️ Syncing Tempo..."
helm upgrade --install tempo grafana/tempo \
  --namespace $NAMESPACE \
  --set tempo.search.enabled=true \
  --set tempo.metricsGenerator.enabled=true

# 3. Promtail (Log Collector)
echo "🪵 Syncing Promtail..."
helm upgrade --install promtail grafana/promtail \
  --namespace $NAMESPACE \
  --set config.clients[0].url=http://loki-gateway.$NAMESPACE.svc.cluster.local/loki/api/v1/push

# 4. OpenTelemetry Collector (Trace Collector)
echo "📡 Syncing OpenTelemetry Collector..."
helm upgrade --install otel-collector open-telemetry/opentelemetry-collector \
  --namespace $NAMESPACE \
  --set mode=deployment \
  --set image.repository="otel/opentelemetry-collector-k8s" \
  --set config.exporters.otlp.endpoint="tempo.$NAMESPACE.svc.cluster.local:4317" \
  --set config.exporters.otlp.tls.insecure=true \
  --set config.service.pipelines.traces.receivers="{otlp}" \
  --set config.service.pipelines.traces.exporters="{otlp}"

# 5. Kube-Prometheus-Stack (Metrics & Dashboards)
echo "📊 Syncing Prometheus & Grafana..."
helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace $NAMESPACE \
  --set grafana.adminPassword=admin \
  --set grafana.initChownData.enabled=false \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.size=2Gi \
  --set grafana.resources.limits.memory=512Mi \
  --set prometheus.prometheusSpec.retention=2d \
  --set "grafana.additionalDataSources[0].name=Loki" \
  --set "grafana.additionalDataSources[0].type=loki" \
  --set "grafana.additionalDataSources[0].url=http://loki-gateway" \
  --set "grafana.additionalDataSources[0].access=proxy" \
  --set "grafana.additionalDataSources[1].name=Tempo" \
  --set "grafana.additionalDataSources[1].type=tempo" \
  --set "grafana.additionalDataSources[1].url=http://tempo:3100" \
  --set "grafana.additionalDataSources[1].access=proxy"

echo "✅ Deployment complete. Checking health..."
kubectl get pods -n $NAMESPACE