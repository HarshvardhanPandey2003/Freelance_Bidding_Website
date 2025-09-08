#!/bin/bash

# Prometheus and Grafana Installation Script for AKS
echo "Installing Prometheus and Grafana with external IPs..."

# Connect to cluster (skip addon disable if already done)
az aks get-credentials --resource-group hvp-aks --name freelance-aks --overwrite-existing

# Add Helm repos and create namespace
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Uninstall existing release if it exists
echo "Cleaning up existing installation..."
helm uninstall prometheus -n monitoring 2>/dev/null || echo "No existing release found"

# Wait for cleanup
sleep 10

# Install with LoadBalancer services using upgrade (handles existing releases)
echo "Installing Prometheus stack with LoadBalancer services..."
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.service.type=LoadBalancer \
  --set prometheus.service.type=LoadBalancer \
  --set alertmanager.service.type=LoadBalancer \
  --set grafana.adminPassword=admin123

# Wait for pods to be ready
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n monitoring --timeout=300s

# Wait for LoadBalancer external IPs (can take 2-5 minutes)
echo "Waiting for external IPs to be assigned..."
echo "This may take 2-5 minutes..."

for i in {1..30}; do
  GRAFANA_IP=$(kubectl get svc prometheus-grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
  if [[ -n "$GRAFANA_IP" ]]; then
    break
  fi
  echo "Still waiting for external IPs... ($i/30)"
  sleep 10
done

# Display access information
echo ""
echo "Access Information:"
echo "==================="

GRAFANA_IP=$(kubectl get svc prometheus-grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
PROM_IP=$(kubectl get svc prometheus-kube-prometheus-prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
ALERT_IP=$(kubectl get svc prometheus-kube-prometheus-alertmanager -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Grafana: http://$GRAFANA_IP (admin/admin123)"
echo "Prometheus: http://$PROM_IP:9090"
echo "AlertManager: http://$ALERT_IP:9093"

if [[ -z "$GRAFANA_IP" ]]; then
  echo ""
  echo "External IPs still pending. Run this command to check status:"
  echo "kubectl get svc -n monitoring"
fi

echo ""
echo "✅ Installation completed!"
