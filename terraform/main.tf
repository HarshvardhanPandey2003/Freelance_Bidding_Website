terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

# Point Terraform to your local Minikube cluster
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
}

# Create a dedicated namespace for your application
# Terraform will just ensure this namespace always exists
resource "kubernetes_namespace" "freelance_app" {
  metadata {
    name = var.namespace
  }
}