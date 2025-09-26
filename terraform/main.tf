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

# Use existing Resource Group (instead of creating new one)
data "azurerm_resource_group" "existing" {
  name = var.resource_group_name
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "aks" {
  name                = "${var.cluster_name}-logs"
  location            = data.azurerm_resource_group.existing.location
  resource_group_name = data.azurerm_resource_group.existing.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Azure Monitor Workspace for Managed Prometheus
resource "azurerm_monitor_workspace" "prometheus" {
  name                = "${var.cluster_name}-prometheus"
  location            = data.azurerm_resource_group.existing.location
  resource_group_name = data.azurerm_resource_group.existing.name
  
  tags = {}
}

# Azure Managed Grafana
resource "azurerm_dashboard_grafana" "grafana" {
  name                              = "${var.cluster_name}-grafana"
  location                          = data.azurerm_resource_group.existing.location
  resource_group_name               = data.azurerm_resource_group.existing.name
  grafana_major_version             = "11"
  
  identity {
    type = "SystemAssigned"
  }
  
  azure_monitor_workspace_integrations {
    resource_id = azurerm_monitor_workspace.prometheus.id
  }
  
  tags = {}
}

# Role assignment to allow Grafana to read monitoring data
resource "azurerm_role_assignment" "grafana_monitoring_reader" {
  scope                = data.azurerm_resource_group.existing.id
  role_definition_name = "Monitoring Reader"
  principal_id         = azurerm_dashboard_grafana.grafana.identity[0].principal_id
}

# Role assignment to allow Grafana to read AKS cluster data
resource "azurerm_role_assignment" "grafana_cluster_monitoring_reader" {
  scope                = azurerm_kubernetes_cluster.main.id
  role_definition_name = "Monitoring Reader"
  principal_id         = azurerm_dashboard_grafana.grafana.identity[0].principal_id
}

# AKS Cluster - Using existing resource group with Managed Prometheus integration
resource "azurerm_kubernetes_cluster" "main" {
  name                = var.cluster_name
  location            = data.azurerm_resource_group.existing.location
  resource_group_name = data.azurerm_resource_group.existing.name
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

  # RBAC Configuration - Enable local accounts
  role_based_access_control_enabled = true
  local_account_disabled            = false

  # Support plan
  support_plan = "KubernetesOfficial"

  # Monitoring using oms_agent block
  oms_agent {
    log_analytics_workspace_id      = azurerm_log_analytics_workspace.aks.id
    msi_auth_for_monitoring_enabled = true
  }

  # Azure Monitor Metrics (Managed Prometheus) - NEW
  monitor_metrics {
    annotations_allowed = null
    labels_allowed     = null
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

  # Ensure Grafana is created before AKS to avoid dependency issues
  depends_on = [
    azurerm_monitor_workspace.prometheus
  ]
}

# Data collection rule association for Prometheus metrics
resource "azurerm_monitor_data_collection_rule_association" "prometheus" {
  name                    = "${var.cluster_name}-prometheus-dcra"
  target_resource_id      = azurerm_kubernetes_cluster.main.id
  data_collection_rule_id = azurerm_monitor_workspace.prometheus.default_data_collection_rule_id
}
