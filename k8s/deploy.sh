#!/bin/bash

# CloudBoard Kubernetes Deployment Script for MicroK8s
# This script deploys the CloudBoard application to MicroK8s

set -e

echo "🚀 Starting CloudBoard deployment to MicroK8s..."

# Check if MicroK8s is running
if ! microk8s status --wait-ready; then
    echo "❌ MicroK8s is not running or not ready"
    exit 1
fi

# Enable required MicroK8s addons
echo "📦 Enabling required MicroK8s addons..."
microk8s enable dns
microk8s enable registry
microk8s enable ingress
microk8s enable storage

# Create namespace
echo "🏗️  Creating namespace..."
microk8s kubectl apply -f namespace.yaml

# Apply storage configurations
echo "💾 Setting up persistent storage..."
microk8s kubectl apply -f storage.yaml

# Wait for storage to be ready
echo "⏳ Waiting for storage to be ready..."
microk8s kubectl wait --for=condition=Available --timeout=60s pv/postgres-pv
microk8s kubectl wait --for=condition=Available --timeout=60s pv/keycloak-pv

# Apply secrets and configmaps
echo "🔐 Applying secrets and configuration..."
microk8s kubectl apply -f secrets.yaml
microk8s kubectl apply -f configmaps.yaml

# Deploy PostgreSQL
echo "🐘 Deploying PostgreSQL..."
microk8s kubectl apply -f postgres.yaml

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
microk8s kubectl wait --for=condition=available --timeout=300s deployment/postgres-deployment -n cloudboard

# Deploy Keycloak (depends on PostgreSQL)
echo "🔑 Deploying Keycloak..."
microk8s kubectl apply -f keycloak.yaml

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
microk8s kubectl wait --for=condition=available --timeout=300s deployment/keycloak-deployment -n cloudboard

# Deploy CloudBoard API (depends on PostgreSQL and Keycloak)
echo "🔧 Deploying CloudBoard API..."
microk8s kubectl apply -f cloudboard-api.yaml

# Wait for API to be ready
echo "⏳ Waiting for CloudBoard API to be ready..."
microk8s kubectl wait --for=condition=available --timeout=300s deployment/cloudboard-api-deployment -n cloudboard

# Deploy CloudBoard Angular Frontend
echo "🌐 Deploying CloudBoard Angular Frontend..."
microk8s kubectl apply -f cloudboard-angular.yaml

# Wait for Angular to be ready
echo "⏳ Waiting for CloudBoard Angular to be ready..."
microk8s kubectl wait --for=condition=available --timeout=300s deployment/cloudboard-angular-deployment -n cloudboard

# Apply ingress configuration
echo "🌍 Setting up ingress..."
microk8s kubectl apply -f ingress.yaml

# Display deployment status
echo "📊 Deployment Status:"
microk8s kubectl get pods -n cloudboard
echo ""
microk8s kubectl get services -n cloudboard
echo ""
microk8s kubectl get ingress -n cloudboard

# Get cluster IP for access instructions
CLUSTER_IP=$(microk8s kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

echo ""
echo "✅ CloudBoard deployment completed successfully!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend (NodePort): http://${CLUSTER_IP}:30080"
echo "   API (NodePort):      http://${CLUSTER_IP}:30081"
echo "   Keycloak (NodePort): http://${CLUSTER_IP}:30082"
echo ""
echo "🏠 For local access, add these to your /etc/hosts file:"
echo "   ${CLUSTER_IP} cloudboard.local"
echo "   ${CLUSTER_IP} keycloak.cloudboard.local"
echo ""
echo "   Then access via:"
echo "   Frontend (Ingress): http://cloudboard.local"
echo "   Keycloak (Ingress): http://keycloak.cloudboard.local"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: microk8s kubectl logs -f deployment/<deployment-name> -n cloudboard"
echo "   Scale app: microk8s kubectl scale deployment/<deployment-name> --replicas=3 -n cloudboard"
echo "   Delete app: microk8s kubectl delete namespace cloudboard"
