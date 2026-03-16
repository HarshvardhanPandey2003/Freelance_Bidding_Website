output "namespace" {
  description = "Application namespace"
  value       = kubernetes_namespace.freelance_app.metadata[0].name
}

output "grafana_access_instructions" {
  description = "How to access your local Grafana dashboard"
  value       = "Run this command: kubectl port-forward svc/prometheus-stack-grafana 8080:80 -n freelance-hub. Then open http://localhost:8080 (Login: admin / admin)"
}