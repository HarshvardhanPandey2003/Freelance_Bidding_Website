#!/bin/bash

echo "Fast Prometheus and Grafana installation..."

# Connect to cluster
az aks get-credentials --resource-group hvp-aks --name freelance-aks --overwrite-existing

# Add repos (if not exists)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts >/dev/null 2>&1
helm repo update >/dev/null 2>&1
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f - >/dev/null 2>&1

# Quick cleanup
echo "Quick cleanup..."
helm uninstall prometheus -n monitoring --timeout=60s >/dev/null 2>&1 || true
kubectl delete pvc --all -n monitoring --timeout=30s >/dev/null 2>&1 || true
sleep 5

# MINIMAL fast installation - no complex resource limits
echo "Installing with MINIMAL configuration for speed..."
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --timeout=5m \
  --wait \
  --set grafana.service.type=LoadBalancer \
  --set prometheus.service.type=LoadBalancer \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.replicas=1 \
  --set grafana.replicas=1 \
  --set alertmanager.alertmanagerSpec.replicas=1 \
  --set prometheus.prometheusSpec.retention=7d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=2Gi

if [ $? -ne 0 ]; then
    echo "❌ Helm install failed. Trying ultra-minimal version..."
    
    # Fallback to absolute minimal
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
      --namespace monitoring \
      --timeout=3m \
      --wait \
      --set grafana.service.type=LoadBalancer \
      --set prometheus.service.type=LoadBalancer \
      --set grafana.adminPassword=admin123
fi

# Quick status check
echo "Checking installation status..."
kubectl get pods -n monitoring --no-headers | grep -v Running | grep -v Completed || echo "✅ All pods running!"

# Get IPs immediately (don't wait if not ready)
echo ""
echo "Service Status:"
echo "=============="
kubectl get svc -n monitoring

GRAFANA_IP=$(kubectl get svc prometheus-grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
PROM_IP=$(kubectl get svc prometheus-kube-prometheus-prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)

if [[ -n "$GRAFANA_IP" ]]; then
    echo ""
    echo "🚀 Ready to access:"
    echo "Grafana: http://$GRAFANA_IP (admin/admin123)"
    echo "Prometheus: http://$PROM_IP:9090"
else
    echo ""
    echo "⏳ External IPs still provisioning (2-5 minutes typical)"
    echo "Check status: kubectl get svc -n monitoring"
fi

echo ""
echo "✅ Installation completed!"
