#!/bin/bash

echo "Installing NGINX Ingress Controller and ArgoCD..."

# Connect to AKS cluster (--overwrite-existing is correct)
az aks get-credentials --resource-group hvp-aks --name freelance-aks --overwrite-existing

# Install NGINX Ingress Controller
echo "Installing NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Create namespace
kubectl create namespace ingress-nginx --dry-run=client -o yaml | kubectl apply -f -

# Install NGINX Ingress Controller with correct syntax
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer \
  --set controller.service.externalTrafficPolicy=Local \
  --set controller.replicaCount=2

# Install ArgoCD
echo "Installing ArgoCD..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for deployments to be ready (fixed timeout syntax)
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/ingress-nginx-controller -n ingress-nginx --timeout=300s
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=300s

# Patch ArgoCD server service to LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Get access information
echo "Getting access information..."
sleep 30

NGINX_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending")
ARGOCD_IP=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending")
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d || echo "Not available")

echo ""
echo "Access Information:"
echo "====================="
echo "NGINX Ingress Controller: $NGINX_IP"
echo "ArgoCD URL: https://$ARGOCD_IP"
echo "ArgoCD Username: admin"
echo "ArgoCD Password: $ARGOCD_PASSWORD"
echo ""
echo "✅ Installation completed!"
echo "📝 Save the ArgoCD password above for future logins"
