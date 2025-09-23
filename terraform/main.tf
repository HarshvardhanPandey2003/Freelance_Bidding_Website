# main.tf

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Get current Azure context for tenant_id
data "azurerm_client_config" "current" {}

# Resource Group
resource "azurerm_resource_group" "aks" {
  name     = var.resource_group_name
  location = var.location
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "aks" {
  name                = "${var.cluster_name}-logs"
  location            = var.location
  resource_group_name = azurerm_resource_group.aks.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# AKS Cluster - Fixed for v4.0
resource "azurerm_kubernetes_cluster" "main" {
  name                = var.cluster_name
  location            = azurerm_resource_group.aks.location
  resource_group_name = azurerm_resource_group.aks.name
  dns_prefix          = var.dns_prefix
  kubernetes_version  = var.kubernetes_version
  node_resource_group = var.node_resource_group

  sku_tier = "Free"

  # System-assigned managed identity
  identity {
    type = "SystemAssigned"
  }

  # Default node pool
  default_node_pool {
    name                   = "agentpool"
    node_count             = 2
    vm_size                = "Standard_D2s_v3"
    auto_scaling_enabled   = true
    min_count              = 2
    max_count              = 3
    os_disk_size_gb        = 128
    max_pods               = 110
    type                   = "VirtualMachineScaleSets"
    node_public_ip_enabled = false
  }

  # Network profile
  network_profile {
    network_plugin     = "azure"
    network_data_plane = "azure"
    load_balancer_sku  = "standard"
    service_cidr       = "10.0.0.0/16"
    dns_service_ip     = "10.0.0.10"
  }

  # RBAC Configuration
  role_based_access_control_enabled = true
  local_account_disabled            = false

  # Azure AD Integration - FIXED: Added required tenant_id
  azure_active_directory_role_based_access_control {
    tenant_id          = data.azurerm_client_config.current.tenant_id
    azure_rbac_enabled = false
  }

  # Support plan
  support_plan = "KubernetesOfficial"

  # Monitoring using oms_agent block
  oms_agent {
    log_analytics_workspace_id      = azurerm_log_analytics_workspace.aks.id
    msi_auth_for_monitoring_enabled = true
  }

  # OIDC Issuer
  oidc_issuer_enabled = false

  # Workload Identity
  workload_identity_enabled = false

  # Azure Policy
  azure_policy_enabled = true

  # Key Vault Secrets Provider
  key_vault_secrets_provider {
    secret_rotation_enabled  = false
    secret_rotation_interval = "2m"
  }

  # Image Cleaner
  image_cleaner_enabled        = true
  image_cleaner_interval_hours = 168

  tags = {}
}
