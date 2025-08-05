# config_template.py - Database Configuration Template
# Copy this file and modify it for your environment

import os

def setup_remote_sql_server():
    """
    Set environment variables for remote SQL Server connection
    """
    
    # Set your actual database credentials here
    os.environ["DB_USERNAME"] = "sa"
    os.environ["DB_PASSWORD"] = "Sanjeev@1234"
    
    # Use remote SQL Server (default)
    os.environ["USE_SQL_EXPRESS"] = "false"
    
    print("✅ Environment variables set for remote SQL Server connection")

def setup_sql_server_express():
    """
    Set environment variables for local SQL Server Express connection
    """
    
    # For SQL Server Express, typically use Windows Authentication
    # No username/password needed
    os.environ.pop("DB_USERNAME", sa)
    os.environ.pop("DB_PASSWORD", Sanjeev@1234)
    
    # Use local SQL Server Express
    os.environ["USE_SQL_EXPRESS"] = "true"
    
    print("✅ Environment variables set for SQL Server Express connection")

def get_connection_string_example():
    """
    Example of how the connection strings will be built
    """
    print("\n🔗 Connection String Examples:")
    
    print("\n1. Remote SQL Server:")
    username = os.getenv("DB_USERNAME", "sa")
    password = os.getenv("DB_PASSWORD", "Sanjeev@1234")
    server = "20.0.97.202\\SQLDemo"
    database = "VibeDB"
    
    remote_string = f"mssql+pyodbc://{username}:{password}@{server}/{database}?driver=ODBC+Driver+17+for+SQL+Server"
    print(f"   {remote_string.replace(password, '***')}")
    
    print("\n2. Local SQL Server Express:")
    express_server = "20.0.97.202\SQLDemo"
    express_string = f"mssql+pyodbc://@{express_server}/{database}?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
    print(f"   {express_string}")

if __name__ == "__main__":
    print("🔧 Database Configuration Setup")
    print("=" * 50)
    
    print("\n📋 Available Configuration Options:")
    print("1. Remote SQL Server (20.0.97.202\\SQLDemo)")
    print("   - Requires username/password")
    print("   - Uses SQL Server Authentication")
    print("   - Default configuration")
    
    print("\n2. Local SQL Server Express")
    print("   - Uses Windows Authentication")
    print("   - No username/password needed")
    print("   - Requires SQL Server Express to be installed locally")
    
    print("\n🔧 Setup Instructions:")
    print("1. For Remote SQL Server:")
    print("   - Update credentials in setup_remote_sql_server()")
    print("   - Uncomment: setup_remote_sql_server()")
    
    print("\n2. For SQL Server Express:")
    print("   - Install SQL Server Express locally")
    print("   - Uncomment: setup_sql_server_express()")
    
    print("\n📝 Manual Environment Variables:")
    print("Remote SQL Server:")
    print("   set DB_USERNAME=your_actual_username")
    print("   set DB_PASSWORD=your_actual_password")
    print("   set USE_SQL_EXPRESS=false")
    
    print("\nSQL Server Express:")
    print("   set USE_SQL_EXPRESS=true")
    
    # Uncomment ONE of the lines below after updating credentials
    # setup_remote_sql_server()
    # setup_sql_server_express()
    
    get_connection_string_example() 