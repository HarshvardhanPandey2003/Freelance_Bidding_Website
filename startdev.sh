#!/bin/bash

# 1. Authenticate upfront so background tasks do not freeze
echo "Minikube Tunnel needs network permissions. Please enter your sudo password:"
sudo -v

PROJECT_DIR="/mnt/c/Users/santj/OneDrive/Documents/GitHub/Freelance_Bidding_Website"

echo "Starting Development Environment..."
mkdir -p "$PROJECT_DIR/logs"

# 2. Check current status of the observability stack
echo "----------------------------------------"
echo "Current Pod Status:"
kubectl get pods -n freelance-hub
echo "----------------------------------------"

# 3. Start Runner in background
echo "Starting GitHub Actions Runner..."
cd ~/actions-runner
nohup ./run.sh > "$PROJECT_DIR/logs/runner.log" 2>&1 &

# 4. Start Tunnel in background
echo "Starting Minikube Tunnel..."
cd "$PROJECT_DIR"
nohup minikube tunnel > "$PROJECT_DIR/logs/tunnel.log" 2>&1 &
sleep 5 # Give the tunnel 5 seconds to establish the connection

# 5. Start Port Forwards in background
echo "Starting Port-Forwards..."
nohup kubectl port-forward svc/prometheus-stack-grafana 8080:80 -n freelance-hub --address 0.0.0.0 > "$PROJECT_DIR/logs/grafana.log" 2>&1 &
nohup kubectl port-forward svc/loki-stack 3100:3100 -n freelance-hub --address 0.0.0.0 > "$PROJECT_DIR/logs/loki.log" 2>&1 &

echo ""
echo "✅ Startup sequence complete!"
echo ""
echo "Access Links:"
echo "Grafana : http://localhost:8080 (Login: admin / admin)"
echo "Loki    : http://localhost:3100/metrics"
echo ""