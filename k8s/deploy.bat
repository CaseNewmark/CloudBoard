@echo off
REM CloudBoard Kubernetes Deployment Script for MicroK8s (Windows)
REM This script deploys the CloudBoard application to MicroK8s

echo Starting CloudBoard deployment to MicroK8s...

REM Check if MicroK8s is running
microk8s status --wait-ready
if %errorlevel% neq 0 (
    echo MicroK8s is not running or not ready
    exit /b 1
)

REM Enable required MicroK8s addons
echo Enabling required MicroK8s addons...
microk8s enable dns
microk8s enable registry
microk8s enable ingress
microk8s enable storage

REM Create namespace
echo Creating namespace...
microk8s kubectl apply -f namespace.yaml

REM Apply storage configurations
echo Setting up persistent storage...
microk8s kubectl apply -f storage.yaml

REM Apply secrets and configmaps
echo Applying secrets and configuration...
microk8s kubectl apply -f secrets.yaml
microk8s kubectl apply -f configmaps.yaml

REM Deploy PostgreSQL
echo Deploying PostgreSQL...
microk8s kubectl apply -f postgres.yaml

REM Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL to be ready...
microk8s kubectl wait --for=condition=available --timeout=300s deployment/postgres-deployment -n cloudboard

REM Deploy Keycloak
echo Deploying Keycloak...
microk8s kubectl apply -f keycloak.yaml

REM Wait for Keycloak to be ready
echo Waiting for Keycloak to be ready...
microk8s kubectl wait --for=condition=available --timeout=300s deployment/keycloak-deployment -n cloudboard

REM Deploy CloudBoard API
echo Deploying CloudBoard API...
microk8s kubectl apply -f cloudboard-api.yaml

REM Wait for API to be ready
echo Waiting for CloudBoard API to be ready...
microk8s kubectl wait --for=condition=available --timeout=300s deployment/cloudboard-api-deployment -n cloudboard

REM Deploy CloudBoard Angular Frontend
echo Deploying CloudBoard Angular Frontend...
microk8s kubectl apply -f cloudboard-angular.yaml

REM Wait for Angular to be ready
echo Waiting for CloudBoard Angular to be ready...
microk8s kubectl wait --for=condition=available --timeout=300s deployment/cloudboard-angular-deployment -n cloudboard

REM Apply ingress configuration
echo Setting up ingress...
microk8s kubectl apply -f ingress.yaml

REM Display deployment status
echo Deployment Status:
microk8s kubectl get pods -n cloudboard
echo.
microk8s kubectl get services -n cloudboard
echo.
microk8s kubectl get ingress -n cloudboard

REM Get cluster IP for access instructions
for /f "tokens=*" %%i in ('microk8s kubectl get nodes -o jsonpath^="{.items[0].status.addresses[?(@.type==\"InternalIP\")].address}"') do set CLUSTER_IP=%%i

echo.
echo CloudBoard deployment completed successfully!
echo.
echo Access your application:
echo    Frontend (NodePort): http://%CLUSTER_IP%:30080
echo    API (NodePort):      http://%CLUSTER_IP%:30081
echo    Keycloak (NodePort): http://%CLUSTER_IP%:30082
echo.
echo For local access, add these to your C:\Windows\System32\drivers\etc\hosts file:
echo    %CLUSTER_IP% cloudboard.local
echo    %CLUSTER_IP% keycloak.cloudboard.local
echo.
echo    Then access via:
echo    Frontend (Ingress): http://cloudboard.local
echo    Keycloak (Ingress): http://keycloak.cloudboard.local
echo.
echo Useful commands:
echo    View logs: microk8s kubectl logs -f deployment/[deployment-name] -n cloudboard
echo    Scale app: microk8s kubectl scale deployment/[deployment-name] --replicas=3 -n cloudboard
echo    Delete app: microk8s kubectl delete namespace cloudboard
