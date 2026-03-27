#!/bin/bash

# 1. Authenticate upfront
echo "Minikube Tunnel needs network permissions. Please enter your sudo password:"
sudo -v

PROJECT_DIR="/mnt/c/Users/santj/OneDrive/Documents/GitHub/Freelance_Bidding_Website"
RUNNER_DIR="$HOME/actions-runner"

echo "Starting Development Environment..."
mkdir -p "$PROJECT_DIR/logs"

# 2. Cleanup old diagnostic logs to prevent the "File already exists" error
echo "Cleaning up old runner logs..."
rm -rf "$RUNNER_DIR/_diag/"*

# 3. Start Runner ONLY if not already running
if pgrep -f "Runner.Listener" > /dev/null; then
    echo "✅ GitHub Actions Runner is already running. Skipping..."
else
    echo "🚀 Starting GitHub Actions Runner..."
    cd "$RUNNER_DIR"
    nohup ./run.sh > "$PROJECT_DIR/logs/runner.log" 2>&1 &
fi

# 4. Start Tunnel ONLY if not already running
if pgrep -f "minikube tunnel" > /dev/null; then
    echo "✅ Minikube Tunnel is already running. Skipping..."
else
    echo "🚀 Starting Minikube Tunnel..."
    cd "$PROJECT_DIR"
    nohup minikube tunnel > "$PROJECT_DIR/logs/tunnel.log" 2>&1 &
    sleep 5 
fi

# 5. Start Port Forwards (Kill old ones first to avoid 'address already in use')
echo "Refreshing Port-Forwards..."
pkill -f "kubectl port-forward" || true

nohup kubectl port-forward svc/prometheus-stack-grafana 8080:80 -n freelance-hub --address 0.0.0.0 > "$PROJECT_DIR/logs/grafana.log" 2>&1 &
nohup kubectl port-forward svc/loki-stack 3100:3100 -n freelance-hub --address 0.0.0.0 > "$PROJECT_DIR/logs/loki.log" 2>&1 &

echo ""
echo "✅ Startup sequence complete!"
echo "----------------------------------------"
kubectl get pods -n freelance-hub
echo "----------------------------------------"
echo "Grafana : http://localhost:8080"
echo "Loki    : http://localhost:3100/metrics"