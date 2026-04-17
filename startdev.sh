#!/bin/bash

set -e

PROJECT_DIR="/mnt/c/Users/santj/OneDrive/Documents/GitHub/Freelance_Bidding_Website"
RUNNER_DIR="$HOME/actions-runner"
LOG_DIR="$PROJECT_DIR/logs"
PID_DIR="$PROJECT_DIR/pids"

mkdir -p "$LOG_DIR"
mkdir -p "$PID_DIR"

echo "🔐 Authenticating sudo..."
sudo -v

echo "🚀 Starting Development Environment..."


# Utility Function
start_process() {
    local name=$1
    local command=$2
    local log_file="$LOG_DIR/$name.log"
    local pid_file="$PID_DIR/$name.pid"

    if [ -f "$pid_file" ] && kill -0 $(cat "$pid_file") 2>/dev/null; then
        echo "✅ $name already running (PID: $(cat $pid_file))"
    else
        echo "🚀 Starting $name..."
        nohup bash -c "$command" > "$log_file" 2>&1 &
        echo $! > "$pid_file"
    fi
}


# Cleanup stale PIDs
echo "🧹 Cleaning stale processes..."
for pid_file in "$PID_DIR"/*.pid; do
    [ -e "$pid_file" ] || continue
    pid=$(cat "$pid_file")
    if ! kill -0 $pid 2>/dev/null; then
        rm -f "$pid_file"
    fi
done


# Metrics Server
echo "📊 Enabling metrics server..."
minikube addons enable metrics-server

echo "⏳ Waiting for metrics server..."
kubectl wait --for=condition=Ready pod -l k8s-app=metrics-server -n kube-system --timeout=60s


# GitHub Runner
start_process "runner" "cd $RUNNER_DIR && ./run.sh"


# Minikube Tunnel
start_process "tunnel" "minikube tunnel"


# Port Forwards (ONLY required ones)
start_process "grafana" \
"kubectl port-forward svc/prometheus-stack-grafana 8080:80 -n freelance-hub --address 0.0.0.0"

start_process "loki" \
"kubectl port-forward svc/loki-stack 3100:3100 -n freelance-hub --address 0.0.0.0"

start_process "argocd" \
"kubectl port-forward svc/argocd-server -n argocd 8081:443"


# Output
echo ""
echo "✅ Startup Complete"
echo "----------------------------------------"
kubectl config set-context --current --namespace=freelance-hub
kubectl get pods -n freelance-hub
echo "----------------------------------------"

echo "🔗 Access URLs:"
echo "Grafana  : http://localhost:8080"
echo "Loki     : http://localhost:3100/metrics"
echo "Registry : http://localhost:35319 (via Minikube addon)"
echo "ArgoCD   : https://localhost:8081"

echo ""
echo "📁 Logs: $LOG_DIR"
echo "📁 PIDs: $PID_DIR"