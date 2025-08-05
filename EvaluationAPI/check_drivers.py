# check_drivers.py - Check available ODBC drivers

try:
    import pyodbc
    print("🔍 Checking available ODBC drivers...")
    print("=" * 50)
    
    drivers = pyodbc.drivers()
    print(f"Found {len(drivers)} ODBC drivers:")
    print()
    
    sql_server_drivers = []
    for i, driver in enumerate(drivers, 1):
        print(f"{i:2}. {driver}")
        if 'sql server' in driver.lower():
            sql_server_drivers.append(driver)
    
    print("\n" + "=" * 50)
    if sql_server_drivers:
        print("✅ SQL Server compatible drivers found:")
        for driver in sql_server_drivers:
            print(f"   - {driver}")
        
        print(f"\n💡 Recommended driver to use: {sql_server_drivers[0]}")
        
        print("\n🔧 Update your DATABASE_CONFIG in database.py:")
        print(f'   "driver": "{sql_server_drivers[0]}"')
        
    else:
        print("❌ No SQL Server drivers found!")
        print("\n📥 You need to install Microsoft ODBC Driver for SQL Server:")
        print("   1. Visit: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server")
        print("   2. Download 'ODBC Driver 17 for SQL Server' or newer")
        print("   3. Install the .msi file")
        print("   4. Restart your command prompt")
        
        print("\n🔄 Alternative drivers you might find:")
        print("   - ODBC Driver 17 for SQL Server")
        print("   - ODBC Driver 18 for SQL Server") 
        print("   - SQL Server Native Client 11.0")
        print("   - SQL Server")
    
    print("\n" + "=" * 50)

except ImportError:
    print("❌ pyodbc not installed. Run: pip install pyodbc")
except Exception as e:
    print(f"❌ Error checking drivers: {e}")

print("✅ Driver check completed!") 