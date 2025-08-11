# Azure App Service Deployment Guide

## Overview
This guide walks you through deploying the EvaluationAPI to Azure App Service with proper configuration management and security.

## Prerequisites

1. **Azure CLI** installed and configured
2. **Azure subscription** with appropriate permissions
3. **Database server** accessible from Azure (firewall rules configured)

## Step 1: Prepare Database Access

### Configure SQL Server Firewall
1. In Azure Portal, go to your SQL Server
2. Add Azure App Service IP ranges to firewall rules
3. Or allow Azure services access

### Update Database Credentials
1. Create a dedicated database user for the application:
```sql
CREATE LOGIN evaluationapi_user WITH PASSWORD = 'StrongPassword123!';
USE TestDB;
CREATE USER evaluationapi_user FOR LOGIN evaluationapi_user;
GRANT SELECT, INSERT, UPDATE ON SCHEMA::dbo TO evaluationapi_user;
```

## Step 2: Deploy to Azure

### Option A: Using Azure CLI Script
1. Update the deployment script:
```bash
# Edit deploy-azure.sh
RESOURCE_GROUP="evaluation-api-rg"
APP_SERVICE_PLAN="evaluation-api-plan"
APP_NAME="your-unique-app-name"
```

2. Run the deployment:
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### Option B: Manual Deployment

1. **Create Resource Group**
```bash
az group create --name evaluation-api-rg --location "East US"
```

2. **Create App Service Plan**
```bash
az appservice plan create \
    --name evaluation-api-plan \
    --resource-group evaluation-api-rg \
    --sku B1 \
    --is-linux
```

3. **Create Web App**
```bash
az webapp create \
    --resource-group evaluation-api-rg \
    --plan evaluation-api-plan \
    --name your-unique-app-name \
    --runtime "PYTHON|3.11" \
    --startup-file "startup.sh"
```

## Step 3: Configure Application Settings

### Database Configuration (REQUIRED)
```bash
az webapp config appsettings set \
    --resource-group evaluation-api-rg \
    --name your-app-name \
    --settings \
        DB_SERVER="20.0.97.202\\SQLDemo" \
        DB_DATABASE="TestDB" \
        DB_USERNAME="evaluationapi_user" \
        DB_PASSWORD="StrongPassword123!" \
        DB_DRIVER="ODBC Driver 17 for SQL Server"
```

### Application Settings
```bash
az webapp config appsettings set \
    --resource-group evaluation-api-rg \
    --name your-app-name \
    --settings \
        DEBUG=false \
        HOST=0.0.0.0 \
        PORT=8000 \
        LOG_LEVEL=INFO \
        ENABLE_SPEECH_RECOGNITION=true \
        MAX_UPLOAD_SIZE=100 \
        UPLOAD_FOLDER=/tmp/uploads
```

### CORS Configuration
```bash
az webapp config appsettings set \
    --resource-group evaluation-api-rg \
    --name your-app-name \
    --settings \
        CORS_ORIGINS="https://your-frontend-domain.com,https://your-app-name.azurewebsites.net"
```

## Step 4: Deploy Code

```bash
az webapp up \
    --resource-group evaluation-api-rg \
    --name your-app-name \
    --runtime "PYTHON|3.11"
```

## Step 5: Verify Deployment

1. **Check API Status**
   - Visit: `https://your-app-name.azurewebsites.net/docs`
   - Should show FastAPI documentation

2. **Test Database Connection**
   - Visit: `https://your-app-name.azurewebsites.net/serviceorders`
   - Should return service orders from database

3. **Monitor Logs**
```bash
az webapp log tail --resource-group evaluation-api-rg --name your-app-name
```

## Security Best Practices

### 1. Use Azure Key Vault (Recommended)
```bash
# Create Key Vault
az keyvault create \
    --name your-keyvault \
    --resource-group evaluation-api-rg \
    --location "East US"

# Store database password
az keyvault secret set \
    --vault-name your-keyvault \
    --name "db-password" \
    --value "StrongPassword123!"

# Configure app to use Key Vault
az webapp identity assign \
    --resource-group evaluation-api-rg \
    --name your-app-name

# Grant access to Key Vault
az keyvault set-policy \
    --name your-keyvault \
    --object-id <app-identity-object-id> \
    --secret-permissions get
```

### 2. Configure Custom Domain (Optional)
```bash
# Add custom domain
az webapp config hostname add \
    --resource-group evaluation-api-rg \
    --webapp-name your-app-name \
    --hostname api.yourdomain.com

# Configure SSL
az webapp config ssl bind \
    --resource-group evaluation-api-rg \
    --name your-app-name \
    --certificate-thumbprint <cert-thumbprint> \
    --ssl-type SNI
```

## Monitoring and Maintenance

### Application Insights
```bash
# Enable Application Insights
az webapp config appsettings set \
    --resource-group evaluation-api-rg \
    --name your-app-name \
    --settings \
        APPINSIGHTS_INSTRUMENTATIONKEY="your-instrumentation-key"
```

### Log Streaming
```bash
# Real-time logs
az webapp log tail --resource-group evaluation-api-rg --name your-app-name

# Download logs
az webapp log download --resource-group evaluation-api-rg --name your-app-name
```

### Scaling
```bash
# Scale up (increase instance size)
az appservice plan update \
    --name evaluation-api-plan \
    --resource-group evaluation-api-rg \
    --sku S1

# Scale out (increase instance count)
az webapp config set \
    --resource-group evaluation-api-rg \
    --name your-app-name \
    --number-of-workers 2
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check firewall rules
   - Verify credentials in Application Settings
   - Test connection from Azure Cloud Shell

2. **Module Import Errors**
   - Check requirements.txt
   - Verify Python version compatibility
   - Review deployment logs

3. **File Upload Issues**
   - Azure App Service has limited local storage
   - Consider using Azure Blob Storage for uploads

### Useful Commands
```bash
# Check application logs
az webapp log tail --resource-group evaluation-api-rg --name your-app-name

# Restart app
az webapp restart --resource-group evaluation-api-rg --name your-app-name

# SSH into container
az webapp ssh --resource-group evaluation-api-rg --name your-app-name

# View configuration
az webapp config show --resource-group evaluation-api-rg --name your-app-name
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_SERVER` | Database server address | Yes | - |
| `DB_DATABASE` | Database name | Yes | - |
| `DB_USERNAME` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_DRIVER` | ODBC driver name | No | ODBC Driver 17 for SQL Server |
| `DEBUG` | Enable debug mode | No | false |
| `HOST` | Host to bind to | No | 0.0.0.0 |
| `PORT` | Port to listen on | No | 8000 |
| `LOG_LEVEL` | Logging level | No | INFO |
| `CORS_ORIGINS` | Allowed CORS origins | No | * |
| `MAX_UPLOAD_SIZE` | Max upload size (MB) | No | 100 |
| `ENABLE_SPEECH_RECOGNITION` | Enable speech features | No | true |
