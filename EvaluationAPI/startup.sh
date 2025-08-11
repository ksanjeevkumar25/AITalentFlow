#!/bin/bash
# startup.sh - Startup script for Azure App Service

echo "Starting EvaluationAPI on Azure App Service..."

# Set default environment variables if not provided
export HOST=${HOST:-"0.0.0.0"}
export PORT=${PORT:-"8000"}
export DEBUG=${DEBUG:-"false"}

# Ensure upload directory exists
mkdir -p /tmp/uploads
chmod 755 /tmp/uploads

# Start the FastAPI application with gunicorn for production
if [ "$DEBUG" = "true" ]; then
    echo "Starting in DEBUG mode with uvicorn..."
    uvicorn main:app --host $HOST --port $PORT --reload
else
    echo "Starting in PRODUCTION mode with gunicorn..."
    gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind $HOST:$PORT --timeout 120
fi
