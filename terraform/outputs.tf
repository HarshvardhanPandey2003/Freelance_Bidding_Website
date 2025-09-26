# outputs.tf
# Shows the outputs of the Terraform configuration after terraform apply
# Using this you can also add it to the automation scripts  
# outputs.tf
output "cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.main.name
}

output "cluster_fqdn" {
  description = "FQDN of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.fqdn
}

output "kube_config" {
  description = "Kubeconfig for the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
}

# New monitoring outputs
output "grafana_url" {
  description = "Azure Managed Grafana Dashboard URL"
  value       = azurerm_dashboard_grafana.grafana.endpoint
}

output "grafana_id" {
  description = "Azure Managed Grafana resource ID"
  value       = azurerm_dashboard_grafana.grafana.id
}

output "prometheus_workspace_id" {
  description = "Azure Monitor Workspace (Prometheus) resource ID"
  value       = azurerm_monitor_workspace.prometheus.id
}

output "prometheus_query_endpoint" {
  description = "Prometheus Query Endpoint for custom integrations"
  value       = azurerm_monitor_workspace.prometheus.query_endpoint
}

output "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID"
  value       = azurerm_log_analytics_workspace.aks.id
}
