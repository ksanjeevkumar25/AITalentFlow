# Docker Setup for InterviewUI

This guide explains how to run InterviewUI using Docker.

## Files Overview

- `Dockerfile` - Production build with Nginx
- `Dockerfile.dev` - Development build with hot reloading
- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development setup
- `.dockerignore` - Files to exclude from Docker build

## Quick Start

### Production Mode

```bash
# Build and run the production container
docker-compose up --build

# Access the application at http://localhost:3000
```

### Development Mode

```bash
# Build and run the development container with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# Access the application at http://localhost:3000
```

## Environment Variables

Create a `.env` file in the root directory to configure the application:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Application Settings
REACT_APP_APP_NAME=InterviewUI
REACT_APP_VERSION=1.0.0

# Development Settings
GENERATE_SOURCEMAP=true
REACT_APP_DEBUG=false
```

## Docker Commands

### Production

```bash
# Build production image
docker build -t interviewui:latest .

# Run production container
docker run -p 3000:80 interviewui:latest

# Run with environment variables
docker run -p 3000:80 -e REACT_APP_API_URL=http://your-api-url interviewui:latest
```

### Development

```bash
# Build development image
docker build -f Dockerfile.dev -t interviewui:dev .

# Run development container with volume mounting
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules interviewui:dev
```

### Docker Compose

```bash
# Production
docker-compose up -d                    # Run in background
docker-compose down                     # Stop containers
docker-compose logs -f interviewui      # View logs

# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

## Image Details

### Production Image
- **Base**: nginx:alpine
- **Size**: ~25MB (optimized)
- **Features**: Static file serving, health checks, SPA routing support

### Development Image
- **Base**: node:18-alpine
- **Features**: Hot reloading, source maps, development tools

## Health Checks

The production container includes health checks:
- **Endpoint**: `http://localhost/`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3

## Network Configuration

Both compose files create isolated networks:
- Production: `interview-network`
- Development: `interview-dev-network`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change the host port in docker-compose.yml if 3000 is in use
2. **Permission issues**: Ensure Docker has access to the project directory
3. **Build failures**: Clear Docker cache with `docker system prune`

### Useful Commands

```bash
# View container logs
docker logs interviewui-app

# Access container shell
docker exec -it interviewui-app sh

# Check container status
docker ps

# Remove unused images
docker image prune
```

## Backend Integration

To integrate with your backend API:

1. Uncomment the API service in `docker-compose.yml`
2. Update the `REACT_APP_API_URL` environment variable
3. Configure CORS on your backend to allow requests from the frontend container

```yaml
# Example backend service
api:
  image: your-backend-image:latest
  container_name: interviewui-api
  ports:
    - "8000:8000"
  networks:
    - interview-network
```

## Production Deployment

For production deployment:

1. Set appropriate environment variables
2. Configure HTTPS/SSL certificates
3. Use proper secrets management
4. Set up monitoring and logging
5. Configure backup strategies

```bash
# Example production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
``` 