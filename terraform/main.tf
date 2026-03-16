terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

# Point Terraform to your local Minikube cluster
provider "kubernetes" {
  config_path    = "C:/Users/santj/.kube/config"
  config_context = "minikube"
}

provider "helm" {
  kubernetes {
    config_path    = "C:/Users/santj/.kube/config"
    config_context = "minikube"
  }
}

# Create a dedicated namespace for your application
resource "kubernetes_namespace" "freelance_app" {
  metadata {
    name = var.namespace
  }
}

# Deploy the Prometheus & Grafana stack locally
# This replaces Azure Managed Prometheus and Azure Managed Grafana
resource "helm_release" "kube-prometheus" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.freelance_app.metadata[0].name
  
  # ADD THIS LINE: Wait up to 15 minutes (900 seconds)
  timeout = 900 

  set {
    name  = "prometheus.prometheusSpec.resources.requests.memory"
    value = "256Mi"
  }
  set {
    name  = "grafana.resources.requests.memory"
    value = "128Mi"
  }
  set {
    name  = "grafana.adminPassword"
    value = "admin"
  }
}