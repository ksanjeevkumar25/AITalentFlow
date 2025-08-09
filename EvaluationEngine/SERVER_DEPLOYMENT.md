# EvaluationEngine Server Deployment

This document provides instructions for deploying the EvaluationEngine server to Azure App Service.

## Prerequisites

1. Azure Account with subscription
2. GitHub repository with the EvaluationEngine code
3. Azure CLI installed (for initial setup)

## Deployment Steps

### 1. Create Azure App Service

```bash
# Login to Azure
az login

# Create a resource group (if you don't have one already)
az group create --name evaluation-engine-rg --location eastus

# Create an App Service Plan
az appservice plan create --name evaluation-engine-plan --resource-group evaluation-engine-rg --sku B1 --is-linux

# Create a Web App
az webapp create --name evaluation-engine-api --resource-group evaluation-engine-rg --plan evaluation-engine-plan --runtime "NODE|16-lts"
```

### 2. Configure Environment Variables in Azure

In Azure Portal:
1. Go to your App Service
2. Navigate to Configuration > Application Settings
3. Add the following settings from your `.env.example` file:
   - DB_USER
   - DB_PASSWORD
   - DB_SERVER
   - DB_DATABASE
   - DB_ENCRYPT
   - DB_TRUST_SERVER_CERTIFICATE
   - DB_INSTANCE
   - FRONTEND_URL (set to your frontend URL)
   - PORT (optional, Azure sets this automatically)

### 3. Configure GitHub Actions Secret

In your GitHub repository:
1. Go to Settings > Secrets
2. Add a new repository secret:
   - Name: AZURE_WEBAPP_PUBLISH_PROFILE_SERVER
   - Value: (Copy the publish profile XML from your Azure App Service)

To get the publish profile:
```bash
# Using Azure CLI
az webapp deployment list-publishing-profiles --name evaluation-engine-api --resource-group evaluation-engine-rg --xml
```

### 4. Trigger Deployment

Push changes to your main branch or manually trigger the workflow from the GitHub Actions tab.

## Local Development Setup

```bash
cd EvaluationEngine
npm install
npm start
```
