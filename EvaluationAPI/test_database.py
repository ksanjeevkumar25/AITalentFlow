# test_database.py - Test script for database module

import os
from database import (
    fetch_employees_from_database, 
    fetch_employee_basic_info,
    get_database_info, 
    test_database_connection,
    get_mock_employees,
    get_database_credentials
)

def test_database_module():
    """
    Test the database module functionality
    """
    print("🧪 Testing Database Module")
    print("=" * 50)
    
    # Test 1: Check credentials setup
    print("\n1. Testing credential configuration...")
    username, password = get_database_credentials()
    print(f"   Username: {username}")
    print(f"   Password: {'[SET]' if password and password != 'your_password' else '[NOT SET]'}")
    
    env_username = os.getenv("DB_USERNAME")
    env_password = os.getenv("DB_PASSWORD")
    print(f"   Environment DB_USERNAME: {'[SET]' if env_username else '[NOT SET]'}")
    print(f"   Environment DB_PASSWORD: {'[SET]' if env_password else '[NOT SET]'}")
    
    if username == "your_username" or password == "your_password":
        print("   ⚠️ Warning: Default credentials detected. Update config_template.py or set environment variables.")
    
    # Test 2: Get database info
    print("\n2. Testing database info...")
    db_info = get_database_info()
    print(f"   Database available: {db_info['available']}")
    print(f"   Server: {db_info['config']['server']}")
    print(f"   Database: {db_info['config']['database']}")
    print(f"   Username: {db_info['config']['username']}")
    print(f"   Password: {db_info['config']['password']}")
    if 'security_note' in db_info:
        print(f"   Security Note: {db_info['security_note']}")
    
    # Test 3: Test connection
    print("\n3. Testing database connection...")
    connection_status = test_database_connection()
    print(f"   Libraries available: {connection_status['libraries_available']}")
    print(f"   Connection tested: {connection_status['connection_tested']}")
    if connection_status['connection_error']:
        print(f"   Connection error: {connection_status['connection_error']}")
    else:
        print("   ✅ Connection successful!")
    
    # Test 4: Get mock employees
    print("\n4. Testing mock employees...")
    mock_employees = get_mock_employees()
    print(f"   Mock employees count: {len(mock_employees)}")
    if mock_employees:
        print(f"   First employee: {mock_employees[0]['first_name']} {mock_employees[0]['last_name']}")
    
    # Test 5: Fetch employees (with fallback)
    print("\n5. Testing employee fetch...")
    try:
        employees, source_info = fetch_employees_from_database()
        print(f"   Employees count: {len(employees)}")
        print(f"   Data source: {source_info['source']}")
        if 'note' in source_info:
            print(f"   Note: {source_info['note']}")
        if 'error' in source_info:
            print(f"   Error: {source_info['error']}")
        
        # Show first employee if available
        if employees:
            emp = employees[0]
            print(f"   First employee: {emp['first_name']} {emp['last_name']} ({emp['department']})")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 6: Fetch basic employee info
    print("\n6. Testing basic employee info fetch...")
    try:
        basic_employees, source_info = fetch_employee_basic_info()
        print(f"   Basic employees count: {len(basic_employees)}")
        print(f"   Data source: {source_info['source']}")
        if 'query' in source_info:
            print(f"   SQL Query: {source_info['query']}")
        if 'note' in source_info:
            print(f"   Note: {source_info['note']}")
        if 'error' in source_info:
            print(f"   Error: {source_info['error']}")
        
        # Show first employee basic info if available
        if basic_employees:
            emp = basic_employees[0]
            print(f"   First employee basic info: {emp['employee_id']} - {emp['first_name']} {emp['last_name']} ({emp['email']})")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Database module test completed!")
    
    # Provide setup instructions if needed
    if username == "your_username" or password == "your_password":
        print("\n🔧 Setup Instructions:")
        print("1. Option A - Environment Variables (Recommended):")
        print("   set DB_USERNAME=your_actual_username")
        print("   set DB_PASSWORD=your_actual_password")
        print("\n2. Option B - Configuration File:")
        print("   - Edit config_template.py")
        print("   - Update credentials and run it before starting the server")
        print("\n3. Option C - Direct Config:")
        print("   - Edit DATABASE_CONFIG in database.py")
        print("   - Replace 'your_username' and 'your_password' with actual values")

def demonstrate_connection_string():
    """
    Show what the connection string would look like (without password)
    """
    print("\n🔗 Connection String Preview:")
    username, password = get_database_credentials()
    server = "20.0.97.202\\SQLDemo"
    database = "VibeDB"
    
    connection_string = f"mssql+pyodbc://{username}:***@{server}/{database}?driver=ODBC+Driver+17+for+SQL+Server"
    print(f"   {connection_string}")

if __name__ == "__main__":
    test_database_module()
    demonstrate_connection_string() 