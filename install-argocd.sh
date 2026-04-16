#!/bin/bash

# Exit on any error, undefined variables, and pipe failures
set -euo pipefail

ARGOCD_NAMESPACE="argocd"
SEALED_SECRETS_LABEL="name=sealed-secrets-controller"

echo "------------------------------------------------------"
echo "🛠️  Starting Cluster Bootstrap: ArgoCD + Sealed Secrets"
echo "------------------------------------------------------"

# 1. Add and Update Argo Repo
echo "📦 Adding ArgoCD Helm repository..."
helm repo add argo https://argoproj.github.io/argo-helm --force-update

echo "🔄 Updating Argo repository..."
helm repo update argo 

# 2. Install ArgoCD
echo "🚀 Installing ArgoCD into namespace: $ARGOCD_NAMESPACE"
helm upgrade --install argocd argo/argo-cd \
    --namespace "$ARGOCD_NAMESPACE" \
    --create-namespace \
    --set server.service.type=ClusterIP \
    --wait --timeout 300s

# 3. Install Sealed Secrets Controller
echo "🔐 Installing Bitnami Sealed Secrets Controller..."
# We use 'apply' here. It's idempotent; if it exists, it just validates.
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml

# 4. Wait for Sealed Secrets to be Ready
echo "⏳ Waiting for Sealed Secrets Controller to initialize..."
# Edge case: The wait might fail if the pod hasn't even been scheduled yet.
# We add a small sleep or a specific 'jsonpath' check if needed, but 'wait' is usually okay.
kubectl wait --for=condition=Ready pods -n kube-system -l "$SEALED_SECRETS_LABEL" --timeout=300s

# 5. Retrieve ArgoCD Initial Password
echo "🔑 Retrieving ArgoCD initial admin password..."
if kubectl get secret argocd-initial-admin-secret -n "$ARGOCD_NAMESPACE" >/dev/null 2>&1; then
    PASS=$(kubectl -n "$ARGOCD_NAMESPACE" get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
    echo "------------------------------------------------------"
    echo "ArgoCD Login Credentials:"
    echo "URL: https://localhost:8080"
    echo "Username: admin"
    echo "Password: $PASS"
    echo "------------------------------------------------------"
else
    echo "Initial secret not found. (Password likely already changed)."
fi

# 6. Final Status Check
echo "✅ Cluster Setup Complete!"
echo "------------------------------------------------------"
echo "1. Access ArgoCD UI:  kubectl port-forward svc/argocd-server -n $ARGOCD_NAMESPACE 8080:443"
echo "2. Sealed Secrets:    Controller is running in kube-system."
echo "3. Next Step:         Apply your 'argocd-freelance-app.yml' to start the GitOps sync."
echo "------------------------------------------------------"