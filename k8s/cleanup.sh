#!/bin/bash
# CloudBoard Complete Cleanup Script for MicroK8s
# This script will remove ALL CloudBoard resources

echo "CloudBoard Complete Cleanup Script"
echo "================================="
echo ""

# Confirm deletion
read -p "This will DELETE ALL CloudBoard data including databases. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo "Starting cleanup..."

# Delete all resources in cloudboard namespace
echo "Deleting all resources in cloudboard namespace..."
microk8s kubectl delete all --all -n cloudboard --force --grace-period=0

# Delete specific resource types that might remain
echo "Deleting remaining resources..."
microk8s kubectl delete configmaps --all -n cloudboard --force --grace-period=0
microk8s kubectl delete secrets --all -n cloudboard --force --grace-period=0
microk8s kubectl delete persistentvolumeclaims --all -n cloudboard --force --grace-period=0
microk8s kubectl delete ingress --all -n cloudboard --force --grace-period=0

# Delete persistent volumes (these are cluster-wide)
echo "Deleting persistent volumes..."
microk8s kubectl delete pv postgres-pv --force --grace-period=0 2>/dev/null || true
microk8s kubectl delete pv keycloak-pv --force --grace-period=0 2>/dev/null || true

# Delete the namespace itself
echo "Deleting cloudboard namespace..."
microk8s kubectl delete namespace cloudboard --force --grace-period=0

# Clean up host directories
echo "Cleaning up host directories..."
sudo rm -rf /opt/cloudboard/postgres-data 2>/dev/null || true
sudo rm -rf /opt/cloudboard/keycloak-data 2>/dev/null || true
sudo rm -rf /opt/cloudboard 2>/dev/null || true

# Clean up any stuck pods with finalizers
echo "Cleaning up any stuck resources..."
microk8s kubectl get pods --all-namespaces | grep cloudboard | awk '{print $2 " -n " $1}' | xargs -r microk8s kubectl delete pod --force --grace-period=0

# Wait for cleanup to complete
echo "Waiting for cleanup to complete..."
sleep 10

# Verify cleanup
echo ""
echo "Verifying cleanup..."
echo "==================="

echo "Remaining pods in cloudboard namespace:"
microk8s kubectl get pods -n cloudboard 2>/dev/null || echo "✓ Namespace not found (good)"

echo ""
echo "Remaining PVCs:"
microk8s kubectl get pvc --all-namespaces | grep cloudboard || echo "✓ No CloudBoard PVCs found (good)"

echo ""
echo "Remaining PVs:"
microk8s kubectl get pv | grep -E "(postgres-pv|keycloak-pv)" || echo "✓ No CloudBoard PVs found (good)"

echo ""
echo "Host directories:"
ls -la /opt/cloudboard/ 2>/dev/null || echo "✓ No CloudBoard directories found (good)"

echo ""
echo "✓ CloudBoard cleanup completed successfully!"
echo ""
echo "To redeploy CloudBoard:"
echo "  1. Run: ./deploy.sh"
echo "  2. Or manually apply: microk8s kubectl apply -f namespace.yaml && microk8s kubectl apply -f ."
echo ""