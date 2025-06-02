# CloudBoard Deployment Guide

This guide provides instructions for deploying the CloudBoard application in various environments.

## Prerequisites

Before deploying CloudBoard, ensure you have the following:

- .NET 8 SDK or higher
- Node.js 18+ and npm
- PostgreSQL 15 or higher
- Docker (optional, for containerized deployment)
- SSL certificate for production deployments

## Local Development Deployment

For local development with .NET Aspire:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CloudBoard.git
   cd CloudBoard
   ```

2. Start the application using Aspire:
   ```bash
   cd CloudBoard.AppHost
   dotnet run
   ```

3. Access the application:
   - Frontend: http://localhost:4200
   - API: http://localhost:5080/api
   - Aspire Dashboard: http://localhost:15152

## Production Deployment Options

### Option 1: Traditional Server Deployment

#### Backend Deployment

1. Publish the API service:
   ```pwsh
   cd CloudBoard.ApiService
   dotnet publish -c Release
   ```

2. Configure a web server (IIS, Nginx, etc.) to host the published API
3. Set up a PostgreSQL database
4. Update the connection string in `appsettings.json`

#### Frontend Deployment

1. Build the Angular application:
   ```pwsh
   cd CloudBoard.Angular
   npm install
   ng build --prod
   ```

2. Deploy the contents of the `dist` folder to a web server
3. Configure the web server to forward API requests to the backend

### Option 2: Docker Deployment

1. Build the Docker images:
   ```pwsh
   docker build -t cloudboard-api -f CloudBoard.ApiService/Dockerfile .
   docker build -t cloudboard-angular -f CloudBoard.Angular/Dockerfile .
   ```

2. Create a Docker Compose file:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:15
       environment:
         POSTGRES_PASSWORD: your_password
         POSTGRES_USER: your_user
         POSTGRES_DB: cloudboard
       volumes:
         - pg_data:/var/lib/postgresql/data
     
     api:
       image: cloudboard-api
       depends_on:
         - db
       environment:
         ConnectionStrings__cloudboard: "Host=db;Database=cloudboard;Username=your_user;Password=your_password"
     
     web:
       image: cloudboard-angular
       ports:
         - "80:80"
       depends_on:
         - api
   
   volumes:
     pg_data:
   ```

3. Start the containers:
   ```pwsh
   docker-compose up -d
   ```

### Option 3: Azure Deployment

#### Deploy to Azure App Service

1. Create an Azure App Service for the API:
   ```pwsh
   az webapp create --resource-group your-resource-group --plan your-app-plan --name cloudboard-api --runtime "DOTNET|8.0"
   ```

2. Create an Azure App Service for the frontend:
   ```pwsh
   az webapp create --resource-group your-resource-group --plan your-app-plan --name cloudboard-frontend --runtime "NODE|18-lts"
   ```

3. Create an Azure Database for PostgreSQL:
   ```pwsh
   az postgres server create --resource-group your-resource-group --name cloudboard-db --admin-user your_admin --admin-password your_password --sku-name GP_Gen5_2
   ```

4. Deploy the API:
   ```pwsh
   cd CloudBoard.ApiService
   dotnet publish -c Release
   az webapp deployment source config-zip --resource-group your-resource-group --name cloudboard-api --src bin/Release/net8.0/publish.zip
   ```

5. Deploy the frontend:
   ```pwsh
   cd CloudBoard.Angular
   npm install
   ng build --prod
   az webapp deployment source config-zip --resource-group your-resource-group --name cloudboard-frontend --src dist/cloudboard-angular.zip
   ```

## Environment Configuration

### API Service Configuration

Key settings in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "cloudboard": "Host=localhost;Database=cloudboard;Username=postgres;Password=your_password"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Angular Configuration

The Angular app is configured to connect to the API service through a proxy in development (`proxy.conf.js`) and through environment files for production builds.

For production, update `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

## Health Monitoring

- API health endpoint: `/health`
- API liveness endpoint: `/alive`

Use these endpoints to configure health checks in your hosting environment.

## Backup and Restore

### Database Backup

```pwsh
pg_dump -h hostname -U username -d cloudboard -F c -f backup.dump
```

### Database Restore

```pwsh
pg_restore -h hostname -U username -d cloudboard -c backup.dump
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string in `appsettings.json`
   - Verify network connectivity to the database
   - Check that database user has proper permissions

2. **CORS Issues**
   - Verify CORS configuration in `Program.cs`
   - Check frontend API URL configuration

3. **Migration Errors**
   - Run migrations manually: `dotnet ef database update`
   - Check database user has schema modification permissions

4. **Application Startup Failures**
   - Check application logs
   - Verify all dependencies are installed correctly
   - Confirm environment variables are set properly
