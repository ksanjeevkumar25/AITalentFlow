# Installing SQL Server Express Drivers

This guide helps you install the necessary drivers for connecting to both SQL Server Express (local) and remote SQL Server instances.

## 🔍 Check Current Drivers

First, check what drivers you already have:

```bash
python check_drivers.py
```

## 📥 Download and Install ODBC Driver

### Option 1: Microsoft ODBC Driver 17 for SQL Server (Recommended)

1. **Download from Microsoft:**
   - Visit: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
   - Download: "ODBC Driver 17 for SQL Server"
   - Choose the x64 version for 64-bit systems

2. **Install:**
   - Run the downloaded `msodbcsql.msi` file
   - Follow the installation wizard
   - Accept the license agreement
   - Complete the installation

### Option 2: Microsoft ODBC Driver 18 for SQL Server (Latest)

Same process as above, but download "ODBC Driver 18 for SQL Server" instead.

### Option 3: Using Package Managers

**Windows Package Manager:**
```bash
winget install Microsoft.ODBCDriver.17.SQLServer
```

**Chocolatey:**
```bash
choco install sql-server-odbc-driver
```

## 🔧 Configuration Options

### Remote SQL Server (Default)

For connecting to `20.0.97.202\SQLDemo`:

```bash
# Set credentials
set DB_USERNAME=your_username
set DB_PASSWORD=your_password
set USE_SQL_EXPRESS=false
```

### Local SQL Server Express

For connecting to a local SQL Server Express instance:

```bash
# Switch to Express mode
set USE_SQL_EXPRESS=true
```

## 🚀 Test Installation

After installing drivers, test your setup:

```bash
# Check available drivers
python check_drivers.py

# Test database connection
python test_database.py

# Start the API
uvicorn main:app --reload
```

## 📋 Common Driver Names

The application will automatically detect these drivers (in order of preference):

1. **ODBC Driver 18 for SQL Server** ⭐ (newest)
2. **ODBC Driver 17 for SQL Server** ⭐ (recommended)
3. **ODBC Driver 13 for SQL Server**
4. **ODBC Driver 11 for SQL Server**
5. **SQL Server Native Client 11.0**
6. **SQL Server Native Client 10.0**
7. **SQL Server Express LocalDB**
8. **SQL Server Express**
9. **SQL Server** (basic)

## 🔍 Verify Driver Installation

### Method 1: Python Check
```python
import pyodbc
print("Available drivers:")
for driver in pyodbc.drivers():
    if 'sql' in driver.lower():
        print(f"  ✅ {driver}")
```

### Method 2: Windows ODBC Data Source Administrator
1. Open "ODBC Data Sources (64-bit)" from Windows
2. Go to the "Drivers" tab
3. Look for SQL Server drivers

### Method 3: PowerShell
```powershell
Get-OdbcDriver | Where-Object {$_.Name -like '*SQL Server*'}
```

## 🔧 Troubleshooting

### Driver Not Found Error
```
[IM002] [Microsoft][ODBC Driver Manager] Data source name not found
```

**Solution:**
1. Install ODBC Driver 17 or 18 for SQL Server
2. Restart your command prompt
3. Run `python check_drivers.py` to verify

### Multiple Drivers Conflict
If you have multiple versions, the application will automatically choose the best one.

### Architecture Mismatch
Ensure you install the 64-bit driver if using 64-bit Python:
```python
import platform
print(f"Python architecture: {platform.architecture()}")
```

## 🎯 Quick Setup Commands

### For Remote SQL Server:
```bash
# Install dependencies
pip install -r requirements.txt

# Set credentials
set DB_USERNAME=your_actual_username
set DB_PASSWORD=your_actual_password

# Test connection
python test_database.py
```

### For Local SQL Server Express:
```bash
# Install dependencies
pip install -r requirements.txt

# Switch to Express mode
set USE_SQL_EXPRESS=true

# Test connection
python test_database.py
```

## ✅ Success Indicators

When everything is working, you should see:
```
✅ Database libraries loaded successfully
   SQLAlchemy version: 1.4.53
   pyodbc version: 5.2.0
📋 Scanning X available ODBC drivers...
✅ Found SQL Server driver: ODBC Driver 17 for SQL Server
🔧 Using remote SQL Server configuration
🔐 Using SQL Server Authentication
🔗 Using driver: ODBC Driver 17 for SQL Server
🔗 Connecting to: 20.0.97.202\SQLDemo/VibeDB
```

## 📞 Support

If you encounter issues:
1. Run `python check_drivers.py` first
2. Check the error messages in `python test_database.py`
3. Verify your credentials and server connectivity
4. Ensure the SQL Server instance is running and accessible 