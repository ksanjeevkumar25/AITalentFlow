# SSL Certificate Error Fix for Azure App Service

## 🚨 Error Description
```
[Microsoft][ODBC Driver 17 for SQL Server]SSL Provider: [error:0A000086:SSL routines::certificate verify failed:self-signed certificate] (-1) (SQLDriverConnect)
```

## 🔧 Root Cause
This error occurs when connecting to SQL Server with SSL encryption enabled, but the server uses a self-signed certificate that cannot be verified.

## ✅ Solution Applied

### 1. Updated Connection String Parameters
Changed `TrustServerCertificate=no` to `TrustServerCertificate=yes` in:

- **databaseOwn.py** (Legacy configuration)
- **config.py** (Environment-based configuration)

### 2. Connection String Components
```
DRIVER={ODBC Driver 17 for SQL Server};
SERVER=20.0.97.202\SQLDemo;
DATABASE=TestDB;
UID=username;
PWD=password;
Encrypt=yes;
TrustServerCertificate=yes;  ← This fixes the SSL error
Connection Timeout=30;
```

## 📋 Azure App Service Configuration

Ensure these settings are configured in Azure App Service:

### Application Settings:
```
DB_SERVER=20.0.97.202\SQLDemo
DB_DATABASE=TestDB
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DRIVER=ODBC Driver 17 for SQL Server
USE_ENV_CONFIG=true
```

## 🔒 Security Considerations

### TrustServerCertificate=yes Implications:
- ✅ **Pros**: Allows connection to servers with self-signed certificates
- ⚠️ **Security Note**: Disables certificate verification (acceptable for trusted internal servers)
- 🔐 **Recommendation**: Use properly signed certificates in production when possible

### Alternative Solutions (if applicable):
1. **Install proper SSL certificate** on SQL Server
2. **Use Azure SQL Database** (automatically has valid certificates)
3. **Configure certificate trust store** in the application

## 🚀 Deployment Steps

1. **Update Code**: The SSL fix has been applied to the codebase
2. **Redeploy**: Push changes to trigger GitHub Actions deployment
3. **Configure App Settings**: Set database credentials in Azure portal
4. **Test Connection**: Verify `/health` endpoint shows database connectivity

## 🧪 Testing the Fix

### Health Check Endpoint:
```bash
curl https://evaluationapi-fhf0f2dsd5ejdqcv.uksouth-01.azurewebsites.net/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-08-11T...",
  "version": "1.0.0"
}
```

### API Endpoints Test:
```bash
# Test questions endpoint
curl https://evaluationapi-fhf0f2dsd5ejdqcv.uksouth-01.azurewebsites.net/api/v1/questions

# Test candidates endpoint
curl https://evaluationapi-fhf0f2dsd5ejdqcv.uksouth-01.azurewebsites.net/api/v1/candidates
```

## 📝 Additional SSL Connection Parameters

If further SSL issues occur, try these additional parameters:

```python
# More permissive SSL settings (development only)
connection_string = (
    f"DRIVER={{{driver}}};"
    f"SERVER={server};"
    f"DATABASE={database};"
    f"UID={username};"
    f"PWD={password};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=yes;"
    f"Connection Timeout=30;"
    f"TrustServerCertificate=yes;"
)

# For maximum compatibility (if needed)
connection_string = (
    f"DRIVER={{{driver}}};"
    f"SERVER={server};"
    f"DATABASE={database};"
    f"UID={username};"
    f"PWD={password};"
    f"Encrypt=optional;"  # Less strict encryption
    f"TrustServerCertificate=yes;"
    f"Connection Timeout=30;"
)
```

## 🔍 Troubleshooting

### If SSL errors persist:

1. **Check SQL Server Configuration**:
   - Verify SSL is properly configured
   - Check certificate validity
   - Ensure SQL Server allows encrypted connections

2. **Test Connection String Locally**:
   ```python
   import pyodbc
   conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=20.0.97.202\\SQLDemo;DATABASE=TestDB;UID=username;PWD=password;Encrypt=yes;TrustServerCertificate=yes;"
   conn = pyodbc.connect(conn_str)
   ```

3. **Alternative Drivers**:
   - Try "SQL Server Native Client 11.0" if available
   - Consider using "ODBC Driver 18 for SQL Server" if installed

## ✅ Status
- [x] SSL certificate error identified
- [x] Connection string updated with TrustServerCertificate=yes
- [x] Both legacy and environment configurations fixed
- [x] Ready for redeployment

The SSL certificate verification error should now be resolved. Redeploy the application to Azure App Service to apply the fix.
