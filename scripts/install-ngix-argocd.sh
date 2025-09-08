#!/bin/bash
echo "Installing NGINX Ingress Controller and ArgoCD..."

# Connect to AKS cluster
az aks get-credentials --resource-group hvp-aks --name freelance-aks --overwrite-existing

# === NGINX Ingress Controller ===
echo " Installing NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

kubectl create namespace ingress-nginx --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux \
  --set controller.service.type=LoadBalancer

# === ArgoCD ===
echo "Installing ArgoCD..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for both to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --timeout=300s
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=300s

# Configure ArgoCD LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Get access information
echo " Getting access information..."
sleep 30

INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
ARGOCD_IP=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo ""
echo "Access Information:"
echo "====================="
echo "NGINX Ingress Controller: $INGRESS_IP"
echo "ArgoCD URL: https://$ARGOCD_IP"
echo "ArgoCD Username: admin"
echo "ArgoCD Password: $ARGOCD_PASSWORD"
echo ""
echo "✅ Installation completed!"
echo "📝 Save the ArgoCD password above for future logins"
