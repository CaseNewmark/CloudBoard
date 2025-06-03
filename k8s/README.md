# CloudBoard Kubernetes Manifests

This directory contains Kubernetes manifests for deploying the CloudBoard application to MicroK8s.

## Architecture

The CloudBoard application consists of:
- **Angular Frontend** (nginx) - User interface
- **ASP.NET Core API** - Backend services
- **PostgreSQL** - Primary database
- **Keycloak** - Identity and access management

## Quick Deployment

### Prerequisites
1. MicroK8s cluster running
2. Container images built and pushed to registry:
   - `jack:32000/cloudboard-api:latest`
   - `jack:32000/cloudboard-angular:latest`

### Deploy Everything
```bash
# Linux/macOS
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

## Manual Deployment Steps

### 1. Enable MicroK8s Addons
```bash
microk8s enable dns registry ingress storage
```

### 2. Deploy in Order
```bash
# 1. Namespace and Storage
microk8s kubectl apply -f namespace.yaml
microk8s kubectl apply -f storage.yaml

# 2. Configuration
microk8s kubectl apply -f secrets.yaml
microk8s kubectl apply -f configmaps.yaml

# 3. Database
microk8s kubectl apply -f postgres.yaml

# 4. Identity Service
microk8s kubectl apply -f keycloak.yaml

# 5. API Service
microk8s kubectl apply -f cloudboard-api.yaml

# 6. Frontend
microk8s kubectl apply -f cloudboard-angular.yaml

# 7. Ingress
microk8s kubectl apply -f ingress.yaml
```

## Access Methods

### NodePort Access (Direct)
- Frontend: `http://<cluster-ip>:30080`
- API: `http://<cluster-ip>:30081`
- Keycloak: `http://<cluster-ip>:30082`

### Ingress Access (Domain-based)
Add to `/etc/hosts` (Linux/macOS) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
<cluster-ip> cloudboard.local
<cluster-ip> keycloak.cloudboard.local
```

Then access:
- Frontend: `http://cloudboard.local`
- Keycloak: `http://keycloak.cloudboard.local`

## Configuration

### Default Credentials
- **PostgreSQL**: `postgres/postgres`
- **Keycloak Admin**: `admin/admin`

### Storage
- **PostgreSQL Data**: `/opt/cloudboard/postgres-data` (5GB)
- **Keycloak Data**: `/opt/cloudboard/keycloak-data` (2GB)

### Resource Allocation
- **PostgreSQL**: 256Mi-512Mi RAM, 250m-500m CPU
- **Keycloak**: 512Mi-1Gi RAM, 500m-1000m CPU
- **API**: 256Mi-512Mi RAM, 250m-500m CPU
- **Frontend**: 64Mi-128Mi RAM, 100m-200m CPU

## Monitoring

### Check Deployment Status
```bash
microk8s kubectl get pods -n cloudboard
microk8s kubectl get services -n cloudboard
microk8s kubectl get ingress -n cloudboard
```

### View Logs
```bash
microk8s kubectl logs -f deployment/postgres-deployment -n cloudboard
microk8s kubectl logs -f deployment/keycloak-deployment -n cloudboard
microk8s kubectl logs -f deployment/cloudboard-api-deployment -n cloudboard
microk8s kubectl logs -f deployment/cloudboard-angular-deployment -n cloudboard
```

### Scaling
```bash
microk8s kubectl scale deployment/cloudboard-api-deployment --replicas=3 -n cloudboard
microk8s kubectl scale deployment/cloudboard-angular-deployment --replicas=3 -n cloudboard
```

## Troubleshooting

### Common Issues
1. **Images not found**: Ensure images are pushed to `jack:32000` registry
2. **Storage issues**: Check if `/opt/cloudboard/` directories exist and are writable
3. **Service dependencies**: PostgreSQL must be ready before Keycloak and API

### Debug Commands
```bash
# Describe problematic pods
microk8s kubectl describe pod <pod-name> -n cloudboard

# Check events
microk8s kubectl get events -n cloudboard --sort-by='.lastTimestamp'

# Port forward for direct access
microk8s kubectl port-forward svc/cloudboard-angular-service 8080:80 -n cloudboard
```

## Cleanup

### Remove Application
```bash
microk8s kubectl delete namespace cloudboard
```

### Remove Storage (Warning: Data Loss)
```bash
sudo rm -rf /opt/cloudboard/
```

## Security Notes

⚠️ **Development Configuration**: This setup uses HTTP-only communication and default credentials. For production:

1. Enable HTTPS/TLS
2. Change default passwords
3. Configure proper authentication
4. Set up network policies
5. Use secure image registry
6. Configure resource quotas and limits
