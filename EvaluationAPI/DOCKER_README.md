# Docker Setup for Interview API

This document provides instructions for running the Interview API using Docker.

## Files Overview

- **Dockerfile**: Main Docker configuration for the FastAPI application
- **docker-compose.yml**: Development configuration with hot-reload and volume mounts
- **docker-compose.prod.yml**: Production configuration with optimizations
- **.dockerignore**: Excludes unnecessary files from Docker build context

## Prerequisites

- Docker Engine 20.0+
- Docker Compose 2.0+
- At least 2GB of available RAM
- Network access to SQL Server (20.0.97.202\SQLDemo)

## Quick Start

### Development Mode

```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The API will be available at http://localhost:8000

### Production Mode

```bash
# Build and start with production configuration
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop the application
docker-compose -f docker-compose.prod.yml down
```

## Build Options

### Build Docker Image Only

```bash
# Build the image
docker build -t interview-api .

# Run the container
docker run -p 8000:8000 interview-api
```

### Build with Custom Tag

```bash
docker build -t interview-api:v1.0.0 .
```

## Environment Variables

The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | SQL Server host | 20.0.97.202\SQLDemo |
| `DATABASE_NAME` | Database name | TestDB |
| `DATABASE_USER` | Database username | sa |
| `DATABASE_PASSWORD` | Database password | Sanjeev@1234 |
| `PYTHONPATH` | Python path | /app |
| `ENVIRONMENT` | Environment mode | development |
| `LOG_LEVEL` | Logging level | info |

## Volumes

### Development Mode
- Source code is mounted for hot-reload: `.:/app`
- Temporary files: `./temp:/app/temp`

### Production Mode
- No source code mounting for security
- Application runs from built image

## Health Checks

The application includes health checks that monitor:
- API availability via `/system-status` endpoint
- Database connectivity
- Audio processing libraries status

Health check configuration:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

## Port Configuration

- **Application**: 8000 (FastAPI + Uvicorn)
- **Nginx** (production): 80 (HTTP), 443 (HTTPS)

## Resource Limits (Production)

- **CPU Limit**: 1.0 core
- **Memory Limit**: 1GB
- **CPU Reservation**: 0.5 core
- **Memory Reservation**: 512MB

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check if SQL Server is accessible
   docker-compose logs interview-api
   
   # Test database connectivity
   docker-compose exec interview-api python -c "import pyodbc; print('ODBC drivers:', pyodbc.drivers())"
   ```

2. **Audio/Video Processing Issues**
   ```bash
   # Check ffmpeg installation
   docker-compose exec interview-api ffmpeg -version
   
   # Check Python audio libraries
   docker-compose exec interview-api python -c "import moviepy, pydub; print('Audio libraries OK')"
   ```

3. **Permission Issues**
   ```bash
   # Check file permissions
   docker-compose exec interview-api ls -la /app
   
   # Check user
   docker-compose exec interview-api whoami
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs interview-api

# Follow logs in real-time
docker-compose logs -f interview-api

# Access container shell
docker-compose exec interview-api bash
```

### Performance Monitoring

```bash
# Check container stats
docker stats

# Monitor resource usage
docker-compose exec interview-api top

# Check disk usage
docker system df
```

## Security Considerations

### Production Deployment

1. **Use environment files for secrets**:
   ```bash
   # Create .env file
   echo "DATABASE_PASSWORD=your_secure_password" > .env
   
   # Reference in docker-compose
   env_file:
     - .env
   ```

2. **Enable HTTPS with SSL certificates**:
   - Configure nginx with SSL certificates
   - Update nginx configuration in `./nginx/nginx.conf`

3. **Network security**:
   - Use private networks
   - Implement firewall rules
   - Restrict database access

4. **Regular updates**:
   ```bash
   # Update base image
   docker-compose pull
   docker-compose up --build -d
   ```

## Scaling

### Horizontal Scaling

```bash
# Scale the API service
docker-compose up --scale interview-api=3 -d
```

### Load Balancer Configuration

Update nginx configuration to distribute load across multiple API instances.

## Backup and Maintenance

### Container Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

### Data Backup

Ensure regular backups of:
- Database (handled separately)
- Uploaded files (if stored locally)
- Configuration files

## API Endpoints

Once running, visit:
- **Health Check**: http://localhost:8000/system-status
- **API Documentation**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Support

For issues related to:
- Docker configuration: Check this README
- Application errors: Check application logs
- Database connectivity: Verify SQL Server configuration
- Audio/Video processing: Check system dependencies 