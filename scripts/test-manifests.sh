#!/bin/bash

echo "🚀 Running GitOps Manifest Tests..."

# Test 1: YAML Syntax
echo "1. Testing YAML syntax..."
python3 -c "
import yaml
import os
import sys

error_count = 0
for root, dirs, files in os.walk('k8s-manifests'):
    for file in files:
        if file.endswith(('.yaml', '.yml')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    yaml.safe_load(f)
                print(f'✅ {filepath}')
            except yaml.YAMLError as e:
                print(f'❌ {filepath}: {e}')
                error_count += 1

if error_count > 0:
    sys.exit(1)
print('All YAML files are valid!')
"

# Test 2: Check for required fields
echo "2. Checking required fields..."

# Check resource limits
if ! grep -r "resources:" k8s-manifests/deployments/; then
  echo "❌ Missing resource limits in deployments"
  exit 1
fi

# Check service account
if ! grep -q "serviceAccountName:" k8s-manifests/deployments/backend.yaml; then
  echo "❌ Missing service account in backend"
  exit 1
fi

echo "✅ All tests passed!"
