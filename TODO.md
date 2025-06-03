# CloudBoard TODO List

## Security & Infrastructure

### SSL/TLS Configuration
- [ ] **Configure HTTPS for MicroK8s Registry**
  - Current state: Registry only supports HTTP (requires `--tls-verify=false` for Podman push)
  - Impact: Insecure image transfers, potential security vulnerability
  - Priority: Medium-High
  - Actions needed:
    - Generate SSL certificates for the registry
    - Configure MicroK8s registry to use HTTPS
    - Update container tools configuration to use secure connections
    - Test secure image push/pull operations

## Deployment & Containerization

### Kubernetes Manifests
- [ ] Create Kubernetes deployment manifests for CloudBoard components
- [ ] Set up PostgreSQL database deployment with persistent storage
- [ ] Configure Keycloak identity service deployment
- [ ] Create service definitions for component communication
- [ ] Set up ingress configuration for external access

### Container Optimization
- [ ] Optimize Docker image sizes
- [ ] Implement multi-architecture builds (ARM64/AMD64)
- [ ] Add health checks to containers
- [ ] Configure proper resource limits and requests

## Application Features

### Authentication & Authorization
- [ ] Complete Keycloak integration
- [ ] Implement JWT token handling
- [ ] Add role-based access control
- [ ] Set up user authentication flows

### Development & Operations
- [ ] Set up CI/CD pipeline
- [ ] Implement automated testing for containers
- [ ] Add monitoring and logging solutions
- [ ] Create backup and disaster recovery procedures

---

**Last Updated:** June 3, 2025  
**Priority Legend:** High = Critical for production, Medium = Important for stability, Low = Nice to have
