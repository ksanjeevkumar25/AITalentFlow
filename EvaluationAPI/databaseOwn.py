import pyodbc
from datetime import datetime
import os

# Import the new configuration
try:
    from config import DatabaseConfig
    USE_ENV_CONFIG = True
except ImportError:
    USE_ENV_CONFIG = False
    print("⚠️ config.py not found, using legacy configuration")

# Legacy Database Configuration (for backward compatibility)
LEGACY_DATABASE_CONFIG = {
    "driver": "SQL Server",
    "server": "20.0.97.202\\SQLDemo", 
    "database": "TestDB",
    "uid": "sa",
    "pwd": "Sanjeev@1234"
}

def get_connection_string():
    """
    Get database connection string from environment variables or fallback to legacy config
    Returns: connection string for pyodbc
    """
    if USE_ENV_CONFIG:
        try:
            return DatabaseConfig.get_connection_string()
        except ValueError as e:
            print(f"⚠️ Environment config error: {e}")
            print("🔄 Falling back to legacy configuration")
    
    # Fallback to legacy configuration
    config = LEGACY_DATABASE_CONFIG
    return (
        f"DRIVER={{{config['driver']}}};"
        f"SERVER={config['server']};"
        f"DATABASE={config['database']};"
        f"UID={config['uid']};"
        f"PWD={config['pwd']};"
    )

def get_database_info():
    """
    Get database configuration information
    Returns: dict with database info
    """
    if USE_ENV_CONFIG:
        try:
            return DatabaseConfig.get_database_info()
        except Exception:
            pass
    
    # Fallback to legacy info
    return {
        "available": True,
        "server": LEGACY_DATABASE_CONFIG['server'],
        "database": LEGACY_DATABASE_CONFIG['database'],
        "driver": LEGACY_DATABASE_CONFIG['driver'],
        "connection_status": "configured"
    }

def fetch_serviceorder_from_databaseOwn():
    """
    Fetch open service orders from SQL Express database
    Returns tuple: (serviceOrders_list, source_info)
    """
    # Initialize return variables
    serviceOrders = []
    source_info = {
        "source": "sql_express_database",
        "database_config": {
            "server": DATABASE_CONFIG['server'],
            "database": DATABASE_CONFIG['database'],
            "table": "ServiceOrder"
        },
        "query": "SELECT ServiceOrderID, AccountName, CCARole FROM ServiceOrder WHERE SOState = 'Open'"
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # Query open service orders with CCARole
        cursor.execute("SELECT ServiceOrderID, AccountName, CCARole FROM ServiceOrder WHERE SOState = 'Open'")

        # Fetch results
        rows = cursor.fetchall()
        
        for row in rows:
            print(row)
            serviceorder = {
                "serviceOrderId": row[0] if len(row) > 0 else None,
                "accountName": row[1] if len(row) > 1 else None,
                "ccaRole": row[2] if len(row) > 2 else None
            }
            serviceOrders.append(serviceorder)
        
        # Close connection
        cursor.close()
        conn.close()
        
        print(f"✅ Successfully fetched {len(serviceOrders)} open service orders from database")
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")
        
        # Return mock data with error information
        serviceOrders = [
            {
                "serviceOrderId": "SO001",
                "accountName": "ABC Corporation",
                "ccaRole": "Technical Lead"
            },
            {
                "serviceOrderId": "SO002",
                "accountName": "XYZ Company",
                "ccaRole": "Project Manager"
            }
        ]
        
        source_info = {
            "source": "mock_data",
            "error": error_message,
            "note": "Using mock data due to database connectivity issues",
            "query": "SELECT ServiceOrderID, AccountName, CCARole FROM ServiceOrder WHERE SOState = 'Open'"
        }
    
    return serviceOrders, source_info

def fetch_employees_from_databaseOwn(serviceOrderId=None):
    """
    Fetch employees from SQL Express database
    If serviceOrderId is provided, filters employees associated with that service order
    Returns tuple: (employees_list, source_info)
    """
    # Initialize return variables
    employees = []
    
    # Build query based on whether serviceOrderId is provided
    if serviceOrderId is None:
        query_text = "SELECT EmployeeID, FirstName, LastName, EmailID FROM Employee"
        query_description = "Fetching all employees"
    else:
        # Find employees who have skills matching the service order requirements
        query_text = """
        SELECT DISTINCT e.EmployeeID, e.FirstName, e.LastName, e.EmailID 
        FROM Employee e, EmployeeSkills es
        WHERE e.EmployeeID = es.EmployeeID AND es.SkillID IN
        (
            SELECT sos.SkillID
            FROM ServiceOrder so, ServiceOrderSkills sos
            WHERE so.ServiceOrderID = sos.ServiceOrderID
                AND sos.ServiceOrderID = ?
        )
        """
        query_description = f"Fetching employees with skills matching ServiceOrderID: {serviceOrderId}"
    
    source_info = {
        "source": "sql_express_database",
        "database_config": {
            "server": DATABASE_CONFIG['server'],
            "database": DATABASE_CONFIG['database'],
            "table": "Employee"
        },
        "query": query_text,
        "query_description": query_description
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # Execute query based on whether serviceOrderId is provided
        if serviceOrderId is None:
            cursor.execute(query_text)
        else:
            cursor.execute(query_text, (serviceOrderId,))

        # Fetch results
        rows = cursor.fetchall()

        for row in rows:
            # Debug: print the row to see its structure
            print(row)
            employee = {
                "employee_id": row[0] if len(row) > 0 else None,        # EmployeeID
                "first_name": row[1] if len(row) > 1 else None,         # FirstName
                "last_name": row[2] if len(row) > 2 else None,          # LastName
                "emailid": row[3] if len(row) > 3 else None         # EmailID
            }
            employees.append(employee)

        # Close connections
        cursor.close()
        conn.close()

        if serviceOrderId is None:
            print(f"✅ Successfully fetched {len(employees)} employees from database")
            source_info["note"] = f"Successfully retrieved {len(employees)} employees"
        else:
            print(f"✅ Successfully fetched {len(employees)} employees for ServiceOrderID: {serviceOrderId}")
            source_info["note"] = f"Successfully retrieved {len(employees)} employees for ServiceOrderID: {serviceOrderId}"

    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")

        # Mock employees data (for fallback when database is not available)
        if serviceOrderId is None:
            employees = [
                {
                    "employee_id": "EMP001",
                    "first_name": "John",
                    "last_name": "Smith",
                    "emailid": "john.smith@company.com"
                },
                {
                    "employee_id": "EMP002",
                    "first_name": "Sarah",
                    "last_name": "Johnson",
                    "emailid": "sarah.johnson@company.com"
                },
                {
                    "employee_id": "EMP003",
                    "first_name": "Mike",
                    "last_name": "Davis",
                    "emailid": "mike.davis@company.com"
                }
            ]
        else:
            # Return filtered mock data based on serviceOrderId
            all_mock_employees = [
                {
                    "employee_id": "EMP001",
                    "first_name": "John",
                    "last_name": "Smith",
                    "emailid": "john.smith@company.com",
                    "mock_service_orders": ["SO001", "SO003"]
                },
                {
                    "employee_id": "EMP002",
                    "first_name": "Sarah",
                    "last_name": "Johnson",
                    "emailid": "sarah.johnson@company.com",
                    "mock_service_orders": ["SO001", "SO002"]
                },
                {
                    "employee_id": "EMP003",
                    "first_name": "Mike",
                    "last_name": "Davis",
                    "emailid": "mike.davis@company.com",
                    "mock_service_orders": ["SO002", "SO004"]
                }
            ]
            
            # Filter mock employees by serviceOrderId
            employees = [
                {k: v for k, v in emp.items() if k != "mock_service_orders"}
                for emp in all_mock_employees 
                if serviceOrderId in emp.get("mock_service_orders", [])
            ]

        if serviceOrderId is None:
            note_message = "Using mock data due to database connectivity issues"
        else:
            note_message = f"Using mock data for ServiceOrderID: {serviceOrderId} due to database connectivity issues"

        source_info = {
            "source": "mock_data",
            "error": error_message,
            "note": note_message,
            "query": query_text,
            "query_description": query_description
        }
    
    return employees, source_info

def fetch_candidates_from_databaseOwn(serviceOrderId=None):
    """
    Fetch candidates from SQL Express database
    If serviceOrderId is provided, filters candidates who have skills matching the service order requirements
    Returns tuple: (candidates_list, source_info)
    """
    # Initialize return variables
    candidates = []
    
    # Build query based on whether serviceOrderId is provided
    if serviceOrderId is None:
        query_text = "SELECT EmployeeID, FirstName, LastName, EmailID FROM Employee"
        query_description = "Fetching all candidates"
    else:
        # Find candidates from PriorityMatchingList for the service order
        query_text = """
        SELECT DISTINCT e.EmployeeID, e.FirstName, e.LastName, e.EmailID 
        FROM Employee e
        INNER JOIN PriorityMatchingList pml ON e.EmployeeID = pml.EmployeeID
        WHERE pml.serviceOrderID = ?
        """
        query_description = f"Fetching candidates from PriorityMatchingList for ServiceOrderID: {serviceOrderId}"
    
    source_info = {
        "source": "sql_express_database",
        "database_config": {
            "server": DATABASE_CONFIG['server'],
            "database": DATABASE_CONFIG['database'],
            "table": "Employee"
        },
        "query": query_text,
        "query_description": query_description
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # Execute query based on whether serviceOrderId is provided
        if serviceOrderId is None:
            cursor.execute(query_text)
        else:
            cursor.execute(query_text, (serviceOrderId,))

        # Fetch results
        rows = cursor.fetchall()

        for row in rows:
            # Debug: print the row to see its structure
            print(row)
            candidate = {
                "candidate_id": row[0] if len(row) > 0 else None,        # EmployeeID (renamed for candidates)
                "first_name": row[1] if len(row) > 1 else None,         # FirstName
                "last_name": row[2] if len(row) > 2 else None,          # LastName
                "emailid": row[3] if len(row) > 3 else None         # EmailID
            }
            candidates.append(candidate)

        # Close connections
        cursor.close()
        conn.close()

        if serviceOrderId is None:
            print(f"✅ Successfully fetched {len(candidates)} candidates from database")
            source_info["note"] = f"Successfully retrieved {len(candidates)} candidates"
        else:
            print(f"✅ Successfully fetched {len(candidates)} candidates for ServiceOrderID: {serviceOrderId}")
            source_info["note"] = f"Successfully retrieved {len(candidates)} candidates for ServiceOrderID: {serviceOrderId}"

    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")

        # Mock candidates data (for fallback when database is not available)
        if serviceOrderId is None:
            candidates = [
                {
                    "candidate_id": "CAND001",
                    "first_name": "Alice",
                    "last_name": "Johnson",
                    "emailid": "alice.johnson@company.com"
                },
                {
                    "candidate_id": "CAND002",
                    "first_name": "Bob",
                    "last_name": "Wilson",
                    "emailid": "bob.wilson@company.com"
                },
                {
                    "candidate_id": "CAND003",
                    "first_name": "Carol",
                    "last_name": "Brown",
                    "emailid": "carol.brown@company.com"
                }
            ]
        else:
            # Return filtered mock data based on serviceOrderId
            all_mock_candidates = [
                {
                    "candidate_id": "CAND001",
                    "first_name": "Alice",
                    "last_name": "Johnson",
                    "emailid": "alice.johnson@company.com",
                    "mock_service_orders": ["SO001", "SO003"]
                },
                {
                    "candidate_id": "CAND002",
                    "first_name": "Bob",
                    "last_name": "Wilson",
                    "emailid": "bob.wilson@company.com",
                    "mock_service_orders": ["SO001", "SO002"]
                },
                {
                    "candidate_id": "CAND003",
                    "first_name": "Carol",
                    "last_name": "Brown",
                    "emailid": "carol.brown@company.com",
                    "mock_service_orders": ["SO002", "SO004"]
                },
                {
                    "candidate_id": "CAND004",
                    "first_name": "David",
                    "last_name": "Miller",
                    "emailid": "david.miller@company.com",
                    "mock_service_orders": ["SO003", "SO005"]
                }
            ]
            
            # Filter mock candidates by serviceOrderId
            candidates = [
                {k: v for k, v in cand.items() if k != "mock_service_orders"}
                for cand in all_mock_candidates 
                if serviceOrderId in cand.get("mock_service_orders", [])
            ]

        if serviceOrderId is None:
            note_message = "Using mock candidate data due to database connectivity issues"
        else:
            note_message = f"Using mock candidate data for ServiceOrderID: {serviceOrderId} due to database connectivity issues"

        source_info = {
            "source": "mock_data",
            "error": error_message,
            "note": note_message,
            "query": query_text,
            "query_description": query_description
        }
    
    return candidates, source_info

def insert_evaluation_to_databaseOwn(service_order_id, employee_id, cognizant_evaluator_id, evaluation_datetime, evaluation_type, final_status="Scheduled"):
    """
    Insert evaluation data into SQL Express database
    Converts evaluation_datetime string to timestamp format for database storage
    Supports multiple datetime formats: 'YYYY-MM-DD HH:MM:SS', 'YYYY-MM-DD HH:MM', 'YYYY-MM-DDTHH:MM:SS', ISO format with microseconds
    Parameters:
    - final_status: Default is "Scheduled" for new evaluations
    Returns dict: response status and details
    """
    response = {
        "status": "error",
        "message": "",
        "data": None
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # Convert evaluation_datetime string to timestamp if it's a string
        if isinstance(evaluation_datetime, str):
            # Try to parse the datetime string
            try:
                # Support multiple datetime formats
                datetime_formats = [
                    '%Y-%m-%d %H:%M:%S',      # 2024-01-15 10:30:00
                    '%Y-%m-%d %H:%M',         # 2025-08-06 08:48
                    '%Y-%m-%dT%H:%M:%S',      # 2024-01-15T10:30:00
                    '%Y-%m-%d %H:%M:%S.%f',   # 2024-01-15 10:30:00.123456
                    '%Y-%m-%dT%H:%M:%S.%f',   # 2024-01-15T10:30:00.123456
                    '%Y-%m-%dT%H:%M:%S.%fZ',  # 2024-01-15T10:30:00.123456Z
                ]
                
                evaluation_datetime_obj = None
                for fmt in datetime_formats:
                    try:
                        evaluation_datetime_obj = datetime.strptime(evaluation_datetime, fmt)
                        break
                    except ValueError:
                        continue
                
                if evaluation_datetime_obj is None:
                    # If no format worked, use current timestamp
                    evaluation_datetime_obj = datetime.now()
                    print(f"⚠️ Could not parse datetime '{evaluation_datetime}', using current timestamp")
                
            except Exception as e:
                # Fallback to current timestamp
                evaluation_datetime_obj = datetime.now()
                print(f"⚠️ Error parsing datetime: {e}, using current timestamp")
        else:
            # If it's already a datetime object, use it as is
            evaluation_datetime_obj = evaluation_datetime

        # Insert evaluation data - handle timestamp column issues
        insertion_method = "standard"
        datetime_inserted = True
        
        try:
            # Try a safer approach by checking what columns exist and avoiding timestamp columns
            # First attempt: Use only the columns we know we want to insert
            insert_query = """
                INSERT INTO EvaluationScheduleStatus (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, EvaluationDateTime, EvaluationType, FinalStatus)
                VALUES (?, ?, ?, ?, ?, ?)
            """
            
            cursor.execute(insert_query, (
                service_order_id,
                employee_id,
                cognizant_evaluator_id,
                evaluation_datetime_obj,
                evaluation_type,
                final_status
            ))
            insertion_method = "standard"
            
        except pyodbc.Error as e:
            error_msg = str(e).lower()
            if "timestamp column" in error_msg or "cannot insert an explicit value into a timestamp column" in error_msg:
                print("⚠️ Timestamp column issue detected, trying alternative approaches...")
                
                # Alternative approach 1: Let SQL Server handle the datetime conversion
                try:
                    insert_query_alt1 = """
                        INSERT INTO EvaluationScheduleStatus (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, EvaluationDateTime, EvaluationType, FinalStatus)
                        VALUES (?, ?, ?, CAST(? AS datetime), ?, ?)
                    """
                    
                    cursor.execute(insert_query_alt1, (
                        service_order_id,
                        employee_id,
                        cognizant_evaluator_id,
                        evaluation_datetime_obj.strftime('%Y-%m-%d %H:%M:%S'),
                        evaluation_type,
                        final_status
                    ))
                    insertion_method = "cast_datetime"
                    print("✅ Successfully inserted using CAST approach")
                    
                except pyodbc.Error as e2:
                    print(f"⚠️ CAST approach failed: {e2}")
                    
                    # Alternative approach 2: Use a different column order or exclude problematic columns
                    try:
                        # Get table schema to identify timestamp columns
                        cursor.execute("""
                            SELECT COLUMN_NAME, DATA_TYPE 
                            FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE TABLE_NAME = 'EvaluationScheduleStatus' 
                            AND DATA_TYPE = 'timestamp'
                        """)
                        timestamp_columns = [row[0] for row in cursor.fetchall()]
                        
                        if timestamp_columns:
                            print(f"Found timestamp columns: {timestamp_columns}")
                        
                        # Try inserting with minimal columns first
                        insert_query_minimal = """
                            INSERT INTO EvaluationScheduleStatus (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, EvaluationType, FinalStatus)
                            VALUES (?, ?, ?, ?, ?)
                        """
                        
                        cursor.execute(insert_query_minimal, (
                            service_order_id,
                            employee_id,
                            cognizant_evaluator_id,
                            evaluation_type,
                            final_status
                        ))
                        insertion_method = "minimal_columns"
                        datetime_inserted = False
                        print("✅ Successfully inserted with minimal columns (excluding EvaluationDateTime)")
                        
                    except pyodbc.Error as e3:
                        print(f"❌ All alternative approaches failed: {e3}")
                        raise e  # Re-raise the original error
            else:
                # Re-raise the original error if it's not timestamp related
                raise e
        
        # Commit the transaction
        conn.commit()
        
        # Get the inserted record ID if available
        cursor.execute("SELECT @@IDENTITY")
        result = cursor.fetchone()
        new_id = result[0] if result else None
        
        # Close connection
        cursor.close()
        conn.close()
        
        # Build response based on insertion method used
        message = "Evaluation record inserted successfully"
        if insertion_method == "cast_datetime":
            message += " (using CAST for datetime)"
        elif insertion_method == "minimal_columns":
            message += " (datetime excluded due to timestamp column conflict)"
        
        response_data = {
            "evaluation_id": new_id,
            "service_order_id": service_order_id,
            "employee_id": employee_id,
            "cognizant_evaluator_id": cognizant_evaluator_id,
            "evaluation_type": evaluation_type,
            "insertion_method": insertion_method
        }
        
        # Only include datetime if it was actually inserted
        if datetime_inserted:
            response_data["evaluation_datetime"] = evaluation_datetime_obj.isoformat() if evaluation_datetime_obj else None
        else:
            response_data["evaluation_datetime"] = None
            response_data["note"] = "EvaluationDateTime was not inserted due to database timestamp column constraints"
        
        response = {
            "status": "success",
            "message": message,
            "data": response_data
        }
        
        print(f"✅ Successfully inserted evaluation record with ID: {new_id} using {insertion_method} method")
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")
        
        response = {
            "status": "error",
            "message": f"Failed to insert evaluation record: {error_message}",
            "data": None
        }
    
    return response

    
 

def fetch_evaluation_schedule_by_status(final_status: str = None):
    """
    Fetch evaluation schedule data from EvaluationScheduleStatus table based on FinalStatus (optional)
    If final_status is None, returns all evaluation schedules
    If final_status is provided, filters by that status
    Returns tuple: (evaluation_schedules_list, source_info)
    """
    # Initialize return variables
    evaluation_schedules = []
    
    # Build query based on whether final_status is provided
    if final_status is None:
        query_description = """
        SELECT ess.ServiceOrderID, ess.EmployeeID, 
               CONCAT(emp.FirstName, ' ', emp.LastName) as candidateName,
               ess.CognizantInterviewer1ID, 
               CONCAT(intrv.FirstName, ' ', intrv.LastName) as InterviewerName,
               ess.CognizantInterviewer2ID, ess.ClientInterviewerName1, ess.ClientInterviewerName2, 
               ess.ClientInterviewerEmail1, ess.ClientInterviewerEmail2, ess.EvaluationDateTime, 
               ess.EvaluationDuration, ess.EvaluationType, ess.EvaluationTranscription, 
               ess.AudioRecording, ess.AudioSavedAt, ess.VideoRecording, ess.VideoSavedAt, 
               ess.EvaluationFeedback, ess.FinalStatus, ess.TranscriptLLMResponse 
        FROM EvaluationScheduleStatus ess
        LEFT JOIN Employee emp ON ess.EmployeeID = emp.EmployeeID
        LEFT JOIN Employee intrv ON ess.CognizantInterviewer1ID = intrv.EmployeeID
        """
    else:
        query_description = f"""
        SELECT ess.ServiceOrderID, ess.EmployeeID, 
               CONCAT(emp.FirstName, ' ', emp.LastName) as candidateName,
               ess.CognizantInterviewer1ID, 
               CONCAT(intrv.FirstName, ' ', intrv.LastName) as InterviewerName,
               ess.CognizantInterviewer2ID, ess.ClientInterviewerName1, ess.ClientInterviewerName2, 
               ess.ClientInterviewerEmail1, ess.ClientInterviewerEmail2, ess.EvaluationDateTime, 
               ess.EvaluationDuration, ess.EvaluationType, ess.EvaluationTranscription, 
               ess.AudioRecording, ess.AudioSavedAt, ess.VideoRecording, ess.VideoSavedAt, 
               ess.EvaluationFeedback, ess.FinalStatus, ess.TranscriptLLMResponse 
        FROM EvaluationScheduleStatus ess
        LEFT JOIN Employee emp ON ess.EmployeeID = emp.EmployeeID
        LEFT JOIN Employee intrv ON ess.CognizantInterviewer1ID = intrv.EmployeeID
        WHERE ess.FinalStatus = '{final_status}'
        """
    
    source_info = {
        "source": "sql_express_database",
        "database_config": {
            "server": DATABASE_CONFIG['server'],
            "database": DATABASE_CONFIG['database'],
            "table": "EvaluationScheduleStatus"
        },
        "query": query_description
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # Query evaluation schedule data based on FinalStatus (optional)
        if final_status is None:
            # Get all evaluation schedules with employee and interviewer names
            query = """
            SELECT ess.ServiceOrderID, ess.EmployeeID, 
                   CONCAT(emp.FirstName, ' ', emp.LastName) as candidateName,
                   ess.CognizantInterviewer1ID, 
                   CONCAT(intrv.FirstName, ' ', intrv.LastName) as InterviewerName,
                   ess.CognizantInterviewer2ID, ess.ClientInterviewerName1, ess.ClientInterviewerName2, 
                   ess.ClientInterviewerEmail1, ess.ClientInterviewerEmail2, ess.EvaluationDateTime, 
                   ess.EvaluationDuration, ess.EvaluationType, ess.EvaluationTranscription, 
                   ess.AudioRecording, ess.AudioSavedAt, ess.VideoRecording, ess.VideoSavedAt, 
                   ess.EvaluationFeedback, ess.FinalStatus, ess.TranscriptLLMResponse 
            FROM EvaluationScheduleStatus ess
            LEFT JOIN Employee emp ON ess.EmployeeID = emp.EmployeeID
            LEFT JOIN Employee intrv ON ess.CognizantInterviewer1ID = intrv.EmployeeID
            """
            cursor.execute(query)
        else:
            # Filter by FinalStatus with employee and interviewer names
            query = """
            SELECT ess.ServiceOrderID, ess.EmployeeID, 
                   CONCAT(emp.FirstName, ' ', emp.LastName) as candidateName,
                   ess.CognizantInterviewer1ID, 
                   CONCAT(intrv.FirstName, ' ', intrv.LastName) as InterviewerName,
                   ess.CognizantInterviewer2ID, ess.ClientInterviewerName1, ess.ClientInterviewerName2, 
                   ess.ClientInterviewerEmail1, ess.ClientInterviewerEmail2, ess.EvaluationDateTime, 
                   ess.EvaluationDuration, ess.EvaluationType, ess.EvaluationTranscription, 
                   ess.AudioRecording, ess.AudioSavedAt, ess.VideoRecording, ess.VideoSavedAt, 
                   ess.EvaluationFeedback, ess.FinalStatus, ess.TranscriptLLMResponse 
            FROM EvaluationScheduleStatus ess
            LEFT JOIN Employee emp ON ess.EmployeeID = emp.EmployeeID
            LEFT JOIN Employee intrv ON ess.CognizantInterviewer1ID = intrv.EmployeeID
            WHERE ess.FinalStatus = ?
            """
            cursor.execute(query, (final_status,))

        # Fetch results
        rows = cursor.fetchall()
        
        for row in rows:
            evaluation_schedule = {
                "serviceOrderId": row[0] if len(row) > 0 else None,
                "employeeId": row[1] if len(row) > 1 else None,
                "candidateName": row[2] if len(row) > 2 else None,
                "cognizantInterviewer1ID": row[3] if len(row) > 3 else None,
                "interviewerName": row[4] if len(row) > 4 else None,
                "cognizantInterviewer2ID": row[5] if len(row) > 5 else None,
                "clientInterviewerName1": row[6] if len(row) > 6 else None,
                "clientInterviewerName2": row[7] if len(row) > 7 else None,
                "clientInterviewerEmail1": row[8] if len(row) > 8 else None,
                "clientInterviewerEmail2": row[9] if len(row) > 9 else None,
                "evaluationDateTime": row[10] if len(row) > 10 else None,
                "evaluationDuration": row[11] if len(row) > 11 else None,
                "evaluationType": row[12] if len(row) > 12 else None,
                "evaluationTranscription": row[13] if len(row) > 13 else None,
                "audioRecording": row[14] if len(row) > 14 else None,
                "audioSavedAt": row[15] if len(row) > 15 else None,
                "videoRecording": row[16] if len(row) > 16 else None,
                "videoSavedAt": row[17] if len(row) > 17 else None,
                "evaluationFeedback": row[18] if len(row) > 18 else None,
                "finalStatus": row[19] if len(row) > 19 else None,
                "transcriptLLMResponse": row[20] if len(row) > 20 else None
            }
            evaluation_schedules.append(evaluation_schedule)
        
        # Close connection
        cursor.close()
        conn.close()
        
        if final_status is None:
            source_info["note"] = f"Successfully retrieved {len(evaluation_schedules)} evaluation schedule records (all statuses)"
            print(f"✅ Retrieved {len(evaluation_schedules)} evaluation schedule records from database (all statuses)")
        else:
            source_info["note"] = f"Successfully retrieved {len(evaluation_schedules)} evaluation schedule records with FinalStatus='{final_status}'"
            print(f"✅ Retrieved {len(evaluation_schedules)} evaluation schedule records from database with FinalStatus='{final_status}'")
        
        return evaluation_schedules, source_info
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error in fetch_evaluation_schedule_by_status: {error_message}")
        
        # Return mock data as fallback
        mock_evaluation_schedules = [
            {
                "serviceOrderID": "SO001",
                "employeeID": "EMP001",
                "candidateName": "John Doe",
                "cognizantInterviewer1ID": "CI001",
                "interviewerName": "Sarah Johnson",
                "cognizantInterviewer2ID": "CI002",
                "clientInterviewerName1": "John Client",
                "clientInterviewerName2": "Jane Client",
                "clientInterviewerEmail1": "john.client@company.com",
                "clientInterviewerEmail2": "jane.client@company.com",
                "evaluationDateTime": "2024-01-15 10:00:00",
                "evaluationDuration": 60,
                "evaluationType": "Technical Interview",
                "evaluationTranscription": "Mock transcription content...",
                "audioRecording": "audio_001.wav",
                "audioSavedAt": "2024-01-15 11:00:00",
                "videoRecording": "video_001.mp4",
                "videoSavedAt": "2024-01-15 11:00:00",
                "evaluationFeedback": "Good technical skills demonstrated",
                "finalStatus": final_status,
                "transcriptLLMResponse": "Mock LLM response based on transcript analysis"
            },
            {
                "serviceOrderID": "SO002",
                "employeeID": "EMP002",
                "candidateName": "Jane Smith",
                "cognizantInterviewer1ID": "CI003",
                "interviewerName": "Michael Brown",
                "cognizantInterviewer2ID": "CI004",
                "clientInterviewerName1": "Bob Client",
                "clientInterviewerName2": "Alice Client",
                "clientInterviewerEmail1": "bob.client@company.com",
                "clientInterviewerEmail2": "alice.client@company.com",
                "evaluationDateTime": "2024-01-16 14:00:00",
                "evaluationDuration": 45,
                "evaluationType": "Behavioral Interview",
                "evaluationTranscription": "Mock behavioral interview transcription...",
                "audioRecording": "audio_002.wav",
                "audioSavedAt": "2024-01-16 14:45:00",
                "videoRecording": "video_002.mp4",
                "videoSavedAt": "2024-01-16 14:45:00",
                "evaluationFeedback": "Strong communication and leadership potential",
                "finalStatus": final_status,
                "transcriptLLMResponse": "Mock LLM response indicating positive behavioral assessment"
            }
        ]
        
        if final_status is None:
            note_message = "Database connection failed, returning mock evaluation schedule data (all statuses)"
        else:
            note_message = f"Database connection failed, returning mock evaluation schedule data for FinalStatus='{final_status}'"
        
        source_info.update({
            "source": "mock_data_fallback",
            "error": error_message,
            "note": note_message
        })
        
        return mock_evaluation_schedules, source_info

    

def update_evaluation_schedule_status(serviceOrderId, employeeId, evaluationTranscription=None, 
                                    audioRecording=None, audioSavedAt=None, videoRecording=None, 
                                    videoSavedAt=None, evaluationFeedback=None, finalStatus=None, 
                                    transcriptLlmResponse=None):
    """
    Update evaluation schedule status in SQL Express database
    Updates only the fields that are provided (not None)
    
    Parameters:
    - audioRecording: boolean (True/False) - converted to 1/0 for SQL Server BIT type
    - videoRecording: boolean (True/False) - converted to 1/0 for SQL Server BIT type
    
    Returns dict: response status and details
    """
    response = {
        "status": "error",
        "message": "",
        "data": None
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # Build dynamic UPDATE query based on provided values
        update_fields = []
        update_values = []
        
        if evaluationTranscription is not None:
            update_fields.append("EvaluationTranscription = ?")
            update_values.append(evaluationTranscription)
            
        if audioRecording is not None:
            update_fields.append("AudioRecording = ?")
            update_values.append(1 if audioRecording else 0)
            
        if audioSavedAt is not None:
            update_fields.append("AudioSavedAt = ?")
            update_values.append(audioSavedAt)
            
        if videoRecording is not None:
            update_fields.append("VideoRecording = ?")
            update_values.append(1 if videoRecording else 0)
            
        if videoSavedAt is not None:
            update_fields.append("VideoSavedAt = ?")
            update_values.append(videoSavedAt)
            
        if evaluationFeedback is not None:
            update_fields.append("EvaluationFeedback = ?")
            update_values.append(evaluationFeedback)
            
        if finalStatus is not None:
            update_fields.append("FinalStatus = ?")
            update_values.append(finalStatus)
            
        if transcriptLlmResponse is not None:
            update_fields.append("TranscriptLLMResponse = ?")
            update_values.append(transcriptLlmResponse)
        
        # Check if there are fields to update
        if not update_fields:
            response = {
                "status": "error",
                "message": "No fields provided for update",
                "data": None
            }
            return response
        
        # Build the complete UPDATE query
        update_query = f"""
            UPDATE EvaluationScheduleStatus 
            SET {', '.join(update_fields)}
            WHERE ServiceOrderID = ? AND EmployeeID = ?
        """
        
        # Add WHERE condition values
        update_values.extend([serviceOrderId, employeeId])
        
        # Execute the update
        cursor.execute(update_query, update_values)
        
        # Get the number of affected rows
        rows_affected = cursor.rowcount
        
        # Commit the transaction
        conn.commit()
        
        # Close connection
        cursor.close()
        conn.close()
        
        if rows_affected > 0:
            response = {
                "status": "success",
                "message": f"Successfully updated {rows_affected} evaluation schedule record(s)",
                "data": {
                    "serviceOrderId": serviceOrderId,
                    "employeeId": employeeId,
                    "rows_affected": rows_affected,
                    "updated_fields": [field.split(' = ')[0] for field in update_fields]
                }
            }
            print(f"✅ Successfully updated evaluation schedule for ServiceOrderID: {serviceOrderId}, EmployeeID: {employeeId}")
        else:
            response = {
                "status": "error",
                "message": f"No evaluation schedule record found with ServiceOrderID: {serviceOrderId} and EmployeeID: {employeeId}",
                "data": {
                    "serviceOrderId": serviceOrderId,
                    "employeeId": employeeId,
                    "rows_affected": 0
                }
            }
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")
        
        response = {
            "status": "error",
            "message": f"Failed to update evaluation schedule: {error_message}",
            "data": {
                "serviceOrderId": serviceOrderId,
                "employeeId": employeeId
            }
        }
    
    return response

    
 

def fetch_evaluation_schedule_by_ids(serviceOrderId, employeeId):
    """
    Fetch specific evaluation schedule data from EvaluationScheduleStatus table 
    based on ServiceOrderID and EmployeeID
    Returns tuple: (evaluation_schedule_dict, source_info)
    """
    # Initialize return variables
    evaluation_schedule = {}
    
    source_info = {
        "source": "database",
        "note": None,
        "error": None,
        "query": f"Fetching evaluation schedule for ServiceOrderID: {serviceOrderId}, EmployeeID: {employeeId}"
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # SQL Query to fetch specific evaluation schedule
        query = """
        SELECT ess.ServiceOrderID, ess.EmployeeID, 
               CONCAT(emp.FirstName, ' ', emp.LastName) as candidateName,
               ess.CognizantInterviewer1ID, 
               CONCAT(intrv.FirstName, ' ', intrv.LastName) as InterviewerName,
               ess.CognizantInterviewer2ID, ess.ClientInterviewerName1, ess.ClientInterviewerName2, 
               ess.ClientInterviewerEmail1, ess.ClientInterviewerEmail2, ess.EvaluationDateTime, 
               ess.EvaluationDuration, ess.EvaluationType, ess.EvaluationTranscription, 
               ess.AudioRecording, ess.AudioSavedAt, ess.VideoRecording, ess.VideoSavedAt, 
               ess.EvaluationFeedback, ess.FinalStatus, ess.TranscriptLLMResponse 
        FROM EvaluationScheduleStatus ess
        LEFT JOIN Employee emp ON ess.EmployeeID = emp.EmployeeID
        LEFT JOIN Employee intrv ON ess.CognizantInterviewer1ID = intrv.EmployeeID
        WHERE ess.ServiceOrderID = ? AND ess.EmployeeID = ?
        """
        
        cursor.execute(query, (serviceOrderId, employeeId))

        # Fetch result
        row = cursor.fetchone()
        
        if row:
            evaluation_schedule = {
                "serviceOrderID": row[0] if len(row) > 0 else None,
                "employeeID": row[1] if len(row) > 1 else None,
                "candidateName": row[2] if len(row) > 2 else None,
                "cognizantInterviewer1ID": row[3] if len(row) > 3 else None,
                "interviewerName": row[4] if len(row) > 4 else None,
                "cognizantInterviewer2ID": row[5] if len(row) > 5 else None,
                "clientInterviewerName1": row[6] if len(row) > 6 else None,
                "clientInterviewerName2": row[7] if len(row) > 7 else None,
                "clientInterviewerEmail1": row[8] if len(row) > 8 else None,
                "clientInterviewerEmail2": row[9] if len(row) > 9 else None,
                "evaluationDateTime": row[10] if len(row) > 10 else None,
                "evaluationDuration": row[11] if len(row) > 11 else None,
                "evaluationType": row[12] if len(row) > 12 else None,
                "evaluationTranscription": row[13] if len(row) > 13 else None,
                "audioRecording": row[14] if len(row) > 14 else None,
                "audioSavedAt": row[15] if len(row) > 15 else None,
                "videoRecording": row[16] if len(row) > 16 else None,
                "videoSavedAt": row[17] if len(row) > 17 else None,
                "evaluationFeedback": row[18] if len(row) > 18 else None,
                "finalStatus": row[19] if len(row) > 19 else None,
                "transcriptLLMResponse": row[20] if len(row) > 20 else None
            }
            source_info["note"] = f"Successfully retrieved evaluation schedule for ServiceOrderID: {serviceOrderId}, EmployeeID: {employeeId}"
        else:
            source_info["note"] = f"No evaluation schedule found for ServiceOrderID: {serviceOrderId}, EmployeeID: {employeeId}"
        
        # Close connection
        cursor.close()
        conn.close()
        
        print(f"✅ Database query successful - Retrieved evaluation schedule for ServiceOrderID: {serviceOrderId}, EmployeeID: {employeeId}")
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Database connection failed: {error_message}")
        
        # Fallback to mock data
        evaluation_schedule = {
            "serviceOrderID": serviceOrderId,
            "employeeID": employeeId,
            "candidateName": "John Doe",
            "cognizantInterviewer1ID": "CI001",
            "interviewerName": "Alice Johnson",
            "cognizantInterviewer2ID": "CI002",
            "clientInterviewerName1": "Client Manager",
            "clientInterviewerName2": "Senior Client",
            "clientInterviewerEmail1": "client.manager@company.com",
            "clientInterviewerEmail2": "senior.client@company.com",
            "evaluationDateTime": "2024-01-15 10:30:00",
            "evaluationDuration": 60,
            "evaluationType": "Technical Interview",
            "evaluationTranscription": "Mock transcription of the technical interview session...",
            "audioRecording": "audio_001.wav",
            "audioSavedAt": "2024-01-15 11:30:00",
            "videoRecording": "video_001.mp4",
            "videoSavedAt": "2024-01-15 11:30:00",
            "evaluationFeedback": "Strong technical skills, good problem-solving approach",
            "finalStatus": "Completed",
            "transcriptLLMResponse": "Mock LLM response indicating strong technical competencies"
        }
        
        source_info.update({
            "source": "mock_data_fallback",
            "error": error_message,
            "note": f"Database connection failed, returning mock evaluation schedule data for ServiceOrderID: {serviceOrderId}, EmployeeID: {employeeId}"
        })
    
    return evaluation_schedule, source_info

    
 

def fetch_evaluation_schedule_by_multiple_statuses(status_list=None):
    """
    Fetch evaluation schedule data from EvaluationScheduleStatus table based on multiple FinalStatus values
    If status_list is None, returns all evaluation schedules
    If status_list is provided, filters by those statuses using IN clause
    Returns tuple: (evaluation_schedules_list, source_info)
    """
    # Initialize return variables
    evaluation_schedules = []
    
    source_info = {
        "source": "database",
        "note": None,
        "error": None,
        "query": None
    }
    
    try:
        # Connect to the database using centralized configuration
        conn = pyodbc.connect(get_connection_string())
        cursor = conn.cursor()

        # Build query based on whether status_list is provided
        if status_list is None or len(status_list) == 0:
            # Get all evaluation schedules
            query = """
            SELECT ess.ServiceOrderID, ess.EmployeeID, 
                   CONCAT(emp.FirstName, ' ', emp.LastName) as candidateName,
                   ess.CognizantInterviewer1ID, 
                   CONCAT(intrv.FirstName, ' ', intrv.LastName) as InterviewerName,
                   ess.CognizantInterviewer2ID, ess.ClientInterviewerName1, ess.ClientInterviewerName2, 
                   ess.ClientInterviewerEmail1, ess.ClientInterviewerEmail2, ess.EvaluationDateTime, 
                   ess.EvaluationDuration, ess.EvaluationType, ess.EvaluationTranscription, 
                   ess.AudioRecording, ess.AudioSavedAt, ess.VideoRecording, ess.VideoSavedAt, 
                   ess.EvaluationFeedback, ess.FinalStatus, ess.TranscriptLLMResponse 
            FROM EvaluationScheduleStatus ess
            LEFT JOIN Employee emp ON ess.EmployeeID = emp.EmployeeID
            LEFT JOIN Employee intrv ON ess.CognizantInterviewer1ID = intrv.EmployeeID
            """
            source_info["query"] = "Fetching all evaluation schedules from EvaluationScheduleStatus"
            cursor.execute(query)
        else:
            # Filter by multiple FinalStatus values using IN clause
            placeholders = ','.join(['?' for _ in status_list])
            query = f"""
            SELECT ess.ServiceOrderID, ess.EmployeeID, 
                   CONCAT(emp.FirstName, ' ', emp.LastName) as candidateName,
                   ess.CognizantInterviewer1ID, 
                   CONCAT(intrv.FirstName, ' ', intrv.LastName) as InterviewerName,
                   ess.CognizantInterviewer2ID, ess.ClientInterviewerName1, ess.ClientInterviewerName2, 
                   ess.ClientInterviewerEmail1, ess.ClientInterviewerEmail2, ess.EvaluationDateTime, 
                   ess.EvaluationDuration, ess.EvaluationType, ess.EvaluationTranscription, 
                   ess.AudioRecording, ess.AudioSavedAt, ess.VideoRecording, ess.VideoSavedAt, 
                   ess.EvaluationFeedback, ess.FinalStatus, ess.TranscriptLLMResponse 
            FROM EvaluationScheduleStatus ess
            LEFT JOIN Employee emp ON ess.EmployeeID = emp.EmployeeID
            LEFT JOIN Employee intrv ON ess.CognizantInterviewer1ID = intrv.EmployeeID
            WHERE ess.FinalStatus IN ({placeholders})
            """
            source_info["query"] = f"Fetching evaluation schedules with FinalStatus IN ({', '.join(status_list)})"
            cursor.execute(query, status_list)

        # Fetch results
        rows = cursor.fetchall()
        
        for row in rows:
            evaluation_schedule = {
                "serviceOrderID": row[0] if len(row) > 0 else None,
                "employeeID": row[1] if len(row) > 1 else None,
                "candidateName": row[2] if len(row) > 2 else None,
                "cognizantInterviewer1ID": row[3] if len(row) > 3 else None,
                "interviewerName": row[4] if len(row) > 4 else None,
                "cognizantInterviewer2ID": row[5] if len(row) > 5 else None,
                "clientInterviewerName1": row[6] if len(row) > 6 else None,
                "clientInterviewerName2": row[7] if len(row) > 7 else None,
                "clientInterviewerEmail1": row[8] if len(row) > 8 else None,
                "clientInterviewerEmail2": row[9] if len(row) > 9 else None,
                "evaluationDateTime": row[10] if len(row) > 10 else None,
                "evaluationDuration": row[11] if len(row) > 11 else None,
                "evaluationType": row[12] if len(row) > 12 else None,
                "evaluationTranscription": row[13] if len(row) > 13 else None,
                "audioRecording": row[14] if len(row) > 14 else None,
                "audioSavedAt": row[15] if len(row) > 15 else None,
                "videoRecording": row[16] if len(row) > 16 else None,
                "videoSavedAt": row[17] if len(row) > 17 else None,
                "evaluationFeedback": row[18] if len(row) > 18 else None,
                "finalStatus": row[19] if len(row) > 19 else None,
                "transcriptLLMResponse": row[20] if len(row) > 20 else None
            }
            evaluation_schedules.append(evaluation_schedule)

        # Close connection
        cursor.close()
        conn.close()
        
        if status_list is None or len(status_list) == 0:
            source_info["note"] = f"Successfully retrieved {len(evaluation_schedules)} evaluation schedule(s) from database (all statuses)"
        else:
            source_info["note"] = f"Successfully retrieved {len(evaluation_schedules)} evaluation schedule(s) from database for statuses: {', '.join(status_list)}"
        
        print(f"✅ Database query successful: {len(evaluation_schedules)} evaluation schedules retrieved")
        
        return evaluation_schedules, source_info
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")
        
        # Return mock data as fallback with matching statuses
        mock_evaluation_schedules = [
            {
                "serviceOrderID": "SO001",
                "employeeID": "EMP001",
                "candidateName": "John Doe",
                "cognizantInterviewer1ID": "CI001",
                "interviewerName": "Sarah Johnson",
                "cognizantInterviewer2ID": "CI002",
                "clientInterviewerName1": "Client Smith",
                "clientInterviewerName2": "Client Jones",
                "clientInterviewerEmail1": "client.smith@company.com",
                "clientInterviewerEmail2": "client.jones@company.com",
                "evaluationDateTime": "2024-01-15 10:00:00",
                "evaluationDuration": 60,
                "evaluationType": "Technical Interview",
                "evaluationTranscription": "Mock technical interview transcription...",
                "audioRecording": "audio_001.wav",
                "audioSavedAt": "2024-01-15 11:00:00",
                "videoRecording": "video_001.mp4",
                "videoSavedAt": "2024-01-15 11:00:00",
                "evaluationFeedback": "Strong technical skills demonstrated",
                "finalStatus": "Selected",
                "transcriptLLMResponse": "Mock LLM response indicating technical proficiency"
            },
            {
                "serviceOrderID": "SO002",
                "employeeID": "EMP002",
                "candidateName": "Jane Smith",
                "cognizantInterviewer1ID": "CI003",
                "interviewerName": "Michael Brown",
                "cognizantInterviewer2ID": "CI004",
                "clientInterviewerName1": "Bob Client",
                "clientInterviewerName2": "Alice Client",
                "clientInterviewerEmail1": "bob.client@company.com",
                "clientInterviewerEmail2": "alice.client@company.com",
                "evaluationDateTime": "2024-01-16 14:00:00",
                "evaluationDuration": 45,
                "evaluationType": "Behavioral Interview",
                "evaluationTranscription": "Mock behavioral interview transcription...",
                "audioRecording": "audio_002.wav",
                "audioSavedAt": "2024-01-16 14:45:00",
                "videoRecording": "video_002.mp4",
                "videoSavedAt": "2024-01-16 14:45:00",
                "evaluationFeedback": "Good communication but needs improvement",
                "finalStatus": "Hold",
                "transcriptLLMResponse": "Mock LLM response indicating mixed assessment"
            },
            {
                "serviceOrderID": "SO003",
                "employeeID": "EMP003",
                "candidateName": "Bob Wilson",
                "cognizantInterviewer1ID": "CI005",
                "interviewerName": "Lisa Davis",
                "cognizantInterviewer2ID": "CI006",
                "clientInterviewerName1": "Tom Client",
                "clientInterviewerName2": "Mary Client",
                "clientInterviewerEmail1": "tom.client@company.com",
                "clientInterviewerEmail2": "mary.client@company.com",
                "evaluationDateTime": "2024-01-17 09:00:00",
                "evaluationDuration": 30,
                "evaluationType": "Technical Interview",
                "evaluationTranscription": "Mock technical interview transcription...",
                "audioRecording": "audio_003.wav",
                "audioSavedAt": "2024-01-17 09:30:00",
                "videoRecording": "video_003.mp4",
                "videoSavedAt": "2024-01-17 09:30:00",
                "evaluationFeedback": "Technical skills below requirements",
                "finalStatus": "Rejected",
                "transcriptLLMResponse": "Mock LLM response indicating technical gaps"
            },
            {
                "serviceOrderID": "SO004",
                "employeeID": "EMP004",
                "candidateName": "Alice Brown",
                "cognizantInterviewer1ID": "CI007",
                "interviewerName": "David Miller",
                "cognizantInterviewer2ID": "CI008",
                "clientInterviewerName1": "Jack Client",
                "clientInterviewerName2": "Emma Client",
                "clientInterviewerEmail1": "jack.client@company.com",
                "clientInterviewerEmail2": "emma.client@company.com",
                "evaluationDateTime": "2024-01-18 16:00:00",
                "evaluationDuration": 40,
                "evaluationType": "Screening Interview",
                "evaluationTranscription": "Mock screening interview transcription...",
                "audioRecording": "audio_004.wav",
                "audioSavedAt": "2024-01-18 16:40:00",
                "videoRecording": "video_004.mp4",
                "videoSavedAt": "2024-01-18 16:40:00",
                "evaluationFeedback": "Requires further evaluation",
                "finalStatus": "Others",
                "transcriptLLMResponse": "Mock LLM response indicating uncertain assessment"
            }
        ]
        
        # Filter mock data by status_list if provided
        if status_list and len(status_list) > 0:
            mock_evaluation_schedules = [
                schedule for schedule in mock_evaluation_schedules 
                if schedule["finalStatus"] in status_list
            ]
        
        if status_list is None or len(status_list) == 0:
            note_message = "Database connection failed, returning mock evaluation schedule data (all statuses)"
        else:
            note_message = f"Database connection failed, returning mock evaluation schedule data for statuses: {', '.join(status_list)}"
        
        source_info.update({
            "source": "mock_data_fallback",
            "error": error_message,
            "note": note_message
        })
        
        return mock_evaluation_schedules, source_info

    
 

