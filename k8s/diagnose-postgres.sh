#!/bin/bash

# PostgreSQL Diagnostic Script
# This script helps diagnose PostgreSQL connectivity issues

set -e

echo "🔍 PostgreSQL Diagnostic Check"
echo "==============================="

# Check if PostgreSQL pod is running
echo "📊 Checking PostgreSQL pod status..."
POSTGRES_POD=$(microk8s kubectl get pods -n cloudboard | grep postgres | grep Running | awk '{print $1}')
if [ -z "$POSTGRES_POD" ]; then
    echo "❌ No running PostgreSQL pod found!"
    echo "   Current PostgreSQL pods:"
    microk8s kubectl get pods -n cloudboard | grep postgres
    echo ""
    echo "🔧 Suggested fix: Restart PostgreSQL deployment"
    echo "   microk8s kubectl delete pod <postgres-pod-name> -n cloudboard"
    exit 1
else
    echo "✅ PostgreSQL pod found: $POSTGRES_POD"
fi

# Check PostgreSQL service
echo ""
echo "🌐 Checking PostgreSQL service..."
microk8s kubectl get svc postgres-service -n cloudboard
SERVICE_IP=$(microk8s kubectl get svc postgres-service -n cloudboard -o jsonpath='{.spec.clusterIP}')
echo "   Service IP: $SERVICE_IP"

# Test PostgreSQL connectivity from within cluster
echo ""
echo "🔌 Testing PostgreSQL connectivity..."
echo "   Testing pg_isready..."
if microk8s kubectl exec $POSTGRES_POD -n cloudboard -- pg_isready -U postgres; then
    echo "✅ PostgreSQL is ready (from within pod)"
else
    echo "❌ PostgreSQL is not ready (from within pod)"
fi

echo ""
echo "   Testing connection from external pod..."
if microk8s kubectl run postgres-test --image=postgres:16-alpine --rm -it --restart=Never -n cloudboard --timeout=30s -- pg_isready -h postgres-service -p 5432 -U postgres; then
    echo "✅ PostgreSQL is accessible from other pods"
else
    echo "❌ PostgreSQL is not accessible from other pods"
    echo "🔧 This might be a network/service issue"
fi

# Check PostgreSQL logs
echo ""
echo "📋 Recent PostgreSQL logs:"
microk8s kubectl logs $POSTGRES_POD -n cloudboard --tail=10

# Check if databases exist
echo ""
echo "💾 Checking databases..."
if microk8s kubectl exec $POSTGRES_POD -n cloudboard -- psql -U postgres -lqt | cut -d \| -f 1 | grep -qw cloudboard; then
    echo "✅ cloudboard database exists"
else
    echo "❌ cloudboard database missing"
fi

if microk8s kubectl exec $POSTGRES_POD -n cloudboard -- psql -U postgres -lqt | cut -d \| -f 1 | grep -qw keycloak; then
    echo "✅ keycloak database exists"
else
    echo "❌ keycloak database missing"
    echo "🔧 Creating keycloak database..."
    microk8s kubectl exec $POSTGRES_POD -n cloudboard -- psql -U postgres -c "CREATE DATABASE keycloak;"
fi

echo ""
echo "🎯 Diagnosis complete!"
echo ""
echo "If PostgreSQL is not accessible from other pods, try:"
echo "1. Delete and recreate PostgreSQL pod:"
echo "   microk8s kubectl delete pod $POSTGRES_POD -n cloudboard"
echo ""
echo "2. Check network policies and DNS:"
echo "   microk8s kubectl get networkpolicies -n cloudboard"
echo "   microk8s kubectl exec <any-pod> -n cloudboard -- nslookup postgres-service"
echo ""
echo "3. Restart CoreDNS if DNS issues:"
echo "   microk8s kubectl rollout restart deployment/coredns -n kube-system"
