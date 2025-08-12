#!/bin/bash
# Azure Static Web Apps Deployment Verification Script

echo "🚀 AI Interview Evaluation Portal - Deployment Verification"
echo "=========================================================="

# Check if required files exist
echo "📁 Checking required files..."
required_files=(
    "package.json"
    "src/App.js"
    "public/index.html"
    "staticwebapp.config.json"
    ".env.example"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
        exit 1
    fi
done

# Check package.json for required scripts
echo -e "\n📦 Checking package.json scripts..."
if grep -q '"build"' package.json; then
    echo "✅ Build script - Found"
else
    echo "❌ Build script - Missing"
    exit 1
fi

# Check environment variables in .env.example
echo -e "\n🔧 Checking environment configuration..."
if grep -q "REACT_APP_API_URL" .env.example; then
    echo "✅ API URL configuration - Found"
else
    echo "❌ API URL configuration - Missing"
    exit 1
fi

# Check GitHub workflow file
echo -e "\n🔄 Checking GitHub workflow..."
workflow_file="../.github/workflows/azure-static-web-apps-wonderful-pond-0e968b103.yml"
if [ -f "$workflow_file" ]; then
    echo "✅ GitHub workflow - Found"
    if grep -q "EvaluationUI" "$workflow_file"; then
        echo "✅ Workflow configured for EvaluationUI"
    else
        echo "❌ Workflow not configured for EvaluationUI"
        exit 1
    fi
else
    echo "❌ GitHub workflow - Missing"
    exit 1
fi

echo -e "\n🎉 All verification checks passed!"
echo "📋 Next steps:"
echo "1. Commit and push changes to trigger deployment"
echo "2. Monitor GitHub Actions for deployment status"
echo "3. Verify application at Azure Static Web Apps URL"
echo "4. Test API connectivity to: https://evaluationapi-fhf0f2dsd5ejdqcv.uksouth-01.azurewebsites.net"
