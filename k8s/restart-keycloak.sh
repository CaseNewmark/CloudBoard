#!/bin/bash

# Script to safely restart Keycloak deployment
# This ensures only one Keycloak pod runs at a time

set -e

echo "🔑 Restarting Keycloak deployment safely..."

# Scale down to 0 to ensure all pods are stopped
echo "📉 Scaling down Keycloak..."
microk8s kubectl scale deployment keycloak-deployment --replicas=0 -n cloudboard

# Wait for all pods to terminate
echo "⏳ Waiting for Keycloak pods to terminate..."
while [ $(microk8s kubectl get pods -n cloudboard | grep keycloak | wc -l) -gt 0 ]; do
    echo "   Still waiting for Keycloak pods to terminate..."
    sleep 5
done

echo "✅ All Keycloak pods terminated"

# Apply the updated configuration
echo "🔧 Applying updated Keycloak configuration..."
microk8s kubectl apply -f keycloak.yaml

# Scale back up to 1
echo "📈 Scaling up Keycloak..."
microk8s kubectl scale deployment keycloak-deployment --replicas=1 -n cloudboard

# Wait for the pod to be ready
echo "⏳ Waiting for Keycloak to be ready..."
microk8s kubectl wait --for=condition=available --timeout=300s deployment/keycloak-deployment -n cloudboard

echo "✅ Keycloak restarted successfully!"

# Show status
microk8s kubectl get pods -n cloudboard | grep keycloak
