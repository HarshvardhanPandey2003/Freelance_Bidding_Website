output "namespace" {
  description = "Application namespace"
  value       = kubernetes_namespace.freelance_app.metadata[0].name
}

output "grafana_url" {
  value = "Run: kubectl port-forward svc/prometheus-stack-grafana 8080:80 -n ${var.namespace}"
}

output "loki_status" {
  value = "Loki is installed. Add http://loki:3100 as a Data Source in Grafana."
}