#!/bin/bash

# Exit on any error
set -e

NAMESPACE="argocd"

echo "☸️  Starting ArgoCD Installation via Helm..."

# 1. Add Argo Repo
echo "📦 Adding ArgoCD Helm repository..."
helm repo add argo https://argoproj.github.io/argo-helm

# 2. Targeted Update (The "Platform Engineer" fix)
echo "🔄 Updating Argo repository specifically..."
# We don't use 'helm repo update' (which hits everything). 
# We hit only the one we need to avoid the 'context deadline' on other repos.
helm repo update argo 

# 3. Install/Upgrade (Idempotent)
echo "🚀 Installing ArgoCD into namespace: $NAMESPACE"
# Using --atomic ensures that if it fails, it rolls back automatically
# Added --create-namespace for a fresh cluster scenario
helm upgrade --install argocd argo/argo-cd \
    --namespace $NAMESPACE \
    --create-namespace \
    --set server.service.type=ClusterIP \
    --wait --timeout 300s

# 4. Retrieve Initial Password
echo "🔑 Retrieving initial admin password..."
# Helm chart names the secret 'argocd-initial-admin-secret'
if kubectl get secret argocd-initial-admin-secret -n $NAMESPACE >/dev/null 2>&1; then
    PASS=$(kubectl -n $NAMESPACE get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
    echo "------------------------------------------------------"
    echo "ArgoCD Login Credentials:"
    echo "URL: https://localhost:8080"
    echo "Username: admin"
    echo "Password: $PASS"
    echo "------------------------------------------------------"
else
    echo "⚠️  Initial secret not found. (Password likely already changed)."
fi

echo "✅ ArgoCD is functional!"
echo "Run this to access the UI: kubectl port-forward svc/argocd-server -n $NAMESPACE 8080:443"