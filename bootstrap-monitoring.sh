#!/bin/bash

# Exit on any error
set -e

NAMESPACE="freelance-hub"

echo "🧹 Pruning old Helm secrets if they are stuck..."
# Edge case: If a previous install failed, it might be in 'pending-install' state.
# We don't delete, we just let 'upgrade --install' handle the sync.

echo "📦 Adding/Updating Repos..."
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update

# 1. Loki (Using your exact SingleBinary settings)
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

# 2. Promtail (Using your EXACT gateway URL)
echo "🪵 Syncing Promtail..."
helm upgrade --install promtail grafana/promtail \
  --namespace $NAMESPACE \
  --set config.clients[0].url=http://loki-gateway.$NAMESPACE.svc.cluster.local/loki/api/v1/push

# 3. Kube-Prometheus-Stack (Using your exact resources and persistence)
echo "📊 Syncing Prometheus & Grafana..."
helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace $NAMESPACE \
  --set grafana.adminPassword=admin \
  --set grafana.initChownData.enabled=false \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.storageClassName=standard \
  --set grafana.persistence.size=2Gi \
  --set grafana.resources.requests.memory=128Mi \
  --set grafana.resources.limits.memory=512Mi \
  --set prometheus.prometheusSpec.resources.requests.memory=256Mi \
  --set prometheus.prometheusSpec.resources.limits.memory=1024Mi \
  --set prometheus.prometheusSpec.retention=2d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=standard \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=5Gi \
  --set "grafana.additionalDataSources[0].name=Loki" \
  --set "grafana.additionalDataSources[0].type=loki" \
  --set "grafana.additionalDataSources[0].url=http://loki-gateway" \
  --set "grafana.additionalDataSources[0].access=proxy"

echo "✅ Deployment complete. Checking health..."
kubectl get pods -n $NAMESPACE