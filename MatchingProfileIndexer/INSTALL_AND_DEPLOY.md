# Quick Azure CLI Installation and Function App Deployment

## Install Azure CLI
# Download and install from: https://aka.ms/installazurecliwindows
# Or use winget:
winget install -e --id Microsoft.AzureCLI

## After installation, restart your terminal and run:

# 1. Login to Azure
az login

# 2. Set your subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# 3. Create resource group
az group create --name "rg-aitalentflow" --location "East US"

# 4. Create storage account
az storage account create --name "aitalentflowstorage" --location "East US" --resource-group "rg-aitalentflow" --sku Standard_LRS

# 5. Create function app
az functionapp create --resource-group "rg-aitalentflow" --consumption-plan-location "East US" --runtime dotnet-isolated --runtime-version 8 --functions-version 4 --name "aitalentflow-matching-indexer" --storage-account "aitalentflowstorage"

# 6. Deploy your function
func azure functionapp publish aitalentflow-matching-indexer

## Function App URLs after deployment:
# Main URL: https://aitalentflow-matching-indexer.azurewebsites.net
# Health Check: https://aitalentflow-matching-indexer.azurewebsites.net/api/health
# Function Endpoint: https://aitalentflow-matching-indexer.azurewebsites.net/api/MatchingProfileIndexer
