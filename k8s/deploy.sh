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

# Check storage status (don't wait for conditions that don't exist)
echo "📋 Checking storage status..."
microk8s kubectl get pv
microk8s kubectl get pvc -n cloudboard

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

# Verify PostgreSQL databases were created
echo "📋 Checking PostgreSQL databases..."
POSTGRES_POD=$(microk8s kubectl get pods -n cloudboard -l app=postgres -o jsonpath='{.items[0].metadata.name}')
echo "PostgreSQL pod: $POSTGRES_POD"
microk8s kubectl exec $POSTGRES_POD -n cloudboard -- psql -U postgres -c "\l" || echo "⚠️  Could not list databases yet"

# Deploy Keycloak (depends on PostgreSQL)
echo "🔑 Deploying Keycloak..."
microk8s kubectl apply -f keycloak.yaml

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
microk8s kubectl wait --for=condition=available --timeout=1200s deployment/keycloak-deployment -n cloudboard

# Deploy CloudBoard API (depends on PostgreSQL and Keycloak) - if files exist
if [ -f "cloudboard-api.yaml" ]; then
    echo "🔧 Deploying CloudBoard API..."
    microk8s kubectl apply -f cloudboard-api.yaml
    
    echo "⏳ Waiting for CloudBoard API to be ready..."
    microk8s kubectl wait --for=condition=available --timeout=300s deployment/cloudboard-api-deployment -n cloudboard
else
    echo "ℹ️  cloudboard-api.yaml not found, skipping API deployment"
fi

# Deploy CloudBoard Angular Frontend - if files exist
if [ -f "cloudboard-angular.yaml" ]; then
    echo "🌐 Deploying CloudBoard Angular Frontend..."
    microk8s kubectl apply -f cloudboard-angular.yaml
    
    echo "⏳ Waiting for CloudBoard Angular to be ready..."
    microk8s kubectl wait --for=condition=available --timeout=300s deployment/cloudboard-angular-deployment -n cloudboard
else
    echo "ℹ️  cloudboard-angular.yaml not found, skipping Angular deployment"
fi

# Apply ingress configuration - if file exists
if [ -f "ingress.yaml" ]; then
    echo "🌍 Setting up ingress..."
    microk8s kubectl apply -f ingress.yaml
else
    echo "ℹ️  ingress.yaml not found, skipping ingress setup"
fi

# Display deployment status
echo ""
echo "📊 Deployment Status:"
echo "===================="
microk8s kubectl get pods -n cloudboard
echo ""
echo "Services:"
microk8s kubectl get services -n cloudboard
echo ""

# Check if ingress exists before showing it
if microk8s kubectl get ingress -n cloudboard >/dev/null 2>&1; then
    echo "Ingress:"
    microk8s kubectl get ingress -n cloudboard
    echo ""
fi

# Get cluster IP for access instructions
CLUSTER_IP=$(microk8s kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

echo "✅ CloudBoard deployment completed successfully!"
echo ""
echo "🌐 Access your application:"

# Check if NodePort services exist
if microk8s kubectl get svc -n cloudboard | grep NodePort >/dev/null 2>&1; then
    echo "   Frontend (NodePort): http://${CLUSTER_IP}:30080"
    echo "   API (NodePort):      http://${CLUSTER_IP}:30081"
    echo "   Keycloak (NodePort): http://${CLUSTER_IP}:30082"
    echo ""
fi

# Check for port forwarding instructions
echo "🔗 For development access, use port forwarding:"
echo "   Keycloak: microk8s kubectl port-forward -n cloudboard service/keycloak-service 8080:8080 --address 0.0.0.0"
echo "   PostgreSQL: microk8s kubectl port-forward -n cloudboard service/postgres-service 5432:5432 --address 0.0.0.0"
echo ""

if microk8s kubectl get ingress -n cloudboard >/dev/null 2>&1; then
    echo "🏠 For ingress access, add to your /etc/hosts file:"
    echo "   ${CLUSTER_IP} cloudboard.local"
    echo "   ${CLUSTER_IP} keycloak.cloudboard.local"
    echo ""
fi

echo "🔧 Useful commands:"
echo "   View logs: microk8s kubectl logs -f deployment/<deployment-name> -n cloudboard"
echo "   List pods: microk8s kubectl get pods -n cloudboard"
echo "   Delete all: microk8s kubectl delete namespace cloudboard"
echo ""