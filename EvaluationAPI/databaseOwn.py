import pyodbc
from datetime import datetime

def fetch_serviceorder_from_databaseOwn():
    """
    Fetch service orders from SQL Express database
    Returns tuple: (serviceOrders_list, source_info)
    """
    # Initialize return variables
    serviceOrders = []
    source_info = {
        "source": "sql_express_database",
        "database_config": {
            "server": "20.0.97.202\\SQLDemo",
            "database": "TestDB",
            "table": "ServiceOrder"
        },
        "query": "SELECT ServiceOrderID, AccountName FROM ServiceOrder"
    }
    
    try:
        # Define connection string
        conn_str = (
            r"DRIVER={SQL Server};"
            r"SERVER=20.0.97.202\SQLDemo;"
            r"DATABASE=TestDB;"
            r"UID=sa;"
            r"PWD=Sanjeev@1234;"
        )

        # Connect to the database
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Query service orders
        cursor.execute("SELECT ServiceOrderID, AccountName FROM ServiceOrder")

        # Fetch results
        rows = cursor.fetchall()
        
        for row in rows:
            print(row)
            serviceorder = {
                "serviceOrderId": row[0] if len(row) > 0 else None,        # OrderID
                "accountName": row[1] if len(row) > 1 else None
            }
            serviceOrders.append(serviceorder)
        
        # Close connection
        cursor.close()
        conn.close()
        
        print(f"✅ Successfully fetched {len(serviceOrders)} service orders from database")
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")
        
        # Return mock data with error information
        serviceOrders = [
            {
                "serviceOrderId": "SO001",
                "accountName": "ABC Corporation"
            }
        ]
        
        source_info = {
            "source": "mock_data",
            "error": error_message,
            "note": "Using mock data due to database connectivity issues",
            "query": "SELECT ServiceOrderID, AccountName FROM ServiceOrder"
        }
    
    return serviceOrders, source_info

def fetch_employees_from_databaseOwn():
    """
    Fetch employees from SQL Express database
    Returns tuple: (employees_list, source_info)
    """
    # Initialize return variables
    employees = []
    source_info = {
        "source": "sql_express_database",
        "database_config": {
            "server": "20.0.97.202\\SQLDemo",
            "database": "VibeDB",
            "table": "Employee"
        },
        "query": "SELECT EmployeeID, FirstName, LastName, EmailID FROM Employee"
    }
    
    try:
        # Define connection string
        conn_str = (
            r"DRIVER={SQL Server};"
            r"SERVER=20.0.97.202\SQLDemo;"
            r"DATABASE=VibeDB;"
            r"UID=sa;"
            r"PWD=Sanjeev@1234;"
        )

        # Connect to the database
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Query employees with specific columns
        cursor.execute("SELECT EmployeeID, FirstName, LastName, EmailID FROM Employee")

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

        print(f"✅ Successfully fetched {len(employees)} employees from database")

    except Exception as e:
        error_message = str(e)
        print(f"❌ Database error: {error_message}")

        # Mock employees data (for fallback when database is not available)
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
            }
        ]

        source_info = {
            "source": "mock_data",
            "error": error_message,
            "note": "Using mock data due to database connectivity issues",
            "query": "SELECT EmployeeID, FirstName, LastName, EmailID FROM Employee"
        }
    
    return employees, source_info

def insert_evaluation_to_databaseOwn(service_order_id, employee_id, cognizant_evaluator_id, evaluation_datetime, evaluation_type):
    """
    Insert evaluation data into SQL Express database
    Converts evaluation_datetime string to timestamp format for database storage
    Supports multiple datetime formats: 'YYYY-MM-DD HH:MM:SS', 'YYYY-MM-DD HH:MM', 'YYYY-MM-DDTHH:MM:SS', ISO format with microseconds
    Returns dict: response status and details
    """
    response = {
        "status": "error",
        "message": "",
        "data": None
    }
    
    try:
        # Define connection string
        conn_str = (
            r"DRIVER={SQL Server};"
            r"SERVER=20.0.97.202\SQLDemo;"
            r"DATABASE=TestDB;"
            r"UID=sa;"
            r"PWD=Sanjeev@1234;"
        )

        # Connect to the database
        conn = pyodbc.connect(conn_str)
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
                INSERT INTO EvaluationScheduleStatus (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, EvaluationDateTime, EvaluationType)
                VALUES (?, ?, ?, ?, ?)
            """
            
            cursor.execute(insert_query, (
                service_order_id,
                employee_id,
                cognizant_evaluator_id,
                evaluation_datetime_obj,
                evaluation_type
            ))
            insertion_method = "standard"
            
        except pyodbc.Error as e:
            error_msg = str(e).lower()
            if "timestamp column" in error_msg or "cannot insert an explicit value into a timestamp column" in error_msg:
                print("⚠️ Timestamp column issue detected, trying alternative approaches...")
                
                # Alternative approach 1: Let SQL Server handle the datetime conversion
                try:
                    insert_query_alt1 = """
                        INSERT INTO EvaluationScheduleStatus (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, EvaluationDateTime, EvaluationType)
                        VALUES (?, ?, ?, CAST(? AS datetime), ?)
                    """
                    
                    cursor.execute(insert_query_alt1, (
                        service_order_id,
                        employee_id,
                        cognizant_evaluator_id,
                        evaluation_datetime_obj.strftime('%Y-%m-%d %H:%M:%S'),
                        evaluation_type
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
                            INSERT INTO EvaluationScheduleStatus (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, EvaluationType)
                            VALUES (?, ?, ?, ?)
                        """
                        
                        cursor.execute(insert_query_minimal, (
                            service_order_id,
                            employee_id,
                            cognizant_evaluator_id,
                            evaluation_type
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
            "server": "20.0.97.202\\SQLDemo",
            "database": "TestDB",
            "table": "EvaluationScheduleStatus"
        },
        "query": query_description
    }
    
    try:
        # Define connection string
        conn_str = (
            r"DRIVER={SQL Server};"
            r"SERVER=20.0.97.202\SQLDemo;"
            r"DATABASE=TestDB;"
            r"UID=sa;"
            r"PWD=Sanjeev@1234;"
        )

        # Connect to the database
        conn = pyodbc.connect(conn_str)
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

    

def update_evaluation_schedule_status(service_order_id, employee_id, evaluation_transcription=None, 
                                    audio_recording=None, audio_saved_at=None, video_recording=None, 
                                    video_saved_at=None, evaluation_feedback=None, final_status=None, 
                                    transcript_llm_response=None):
    """
    Update evaluation schedule status in SQL Express database
    Updates only the fields that are provided (not None)
    Returns dict: response status and details
    """
    response = {
        "status": "error",
        "message": "",
        "data": None
    }
    
    try:
        # Define connection string
        conn_str = (
            r"DRIVER={SQL Server};"
            r"SERVER=20.0.97.202\SQLDemo;"
            r"DATABASE=TestDB;"
            r"UID=sa;"
            r"PWD=Sanjeev@1234;"
        )

        # Connect to the database
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Build dynamic UPDATE query based on provided values
        update_fields = []
        update_values = []
        
        if evaluation_transcription is not None:
            update_fields.append("EvaluationTranscription = ?")
            update_values.append(evaluation_transcription)
            
        if audio_recording is not None:
            update_fields.append("AudioRecording = ?")
            update_values.append(audio_recording)
            
        if audio_saved_at is not None:
            update_fields.append("AudioSavedAt = ?")
            update_values.append(audio_saved_at)
            
        if video_recording is not None:
            update_fields.append("VideoRecording = ?")
            update_values.append(video_recording)
            
        if video_saved_at is not None:
            update_fields.append("VideoSavedAt = ?")
            update_values.append(video_saved_at)
            
        if evaluation_feedback is not None:
            update_fields.append("EvaluationFeedback = ?")
            update_values.append(evaluation_feedback)
            
        if final_status is not None:
            update_fields.append("FinalStatus = ?")
            update_values.append(final_status)
            
        if transcript_llm_response is not None:
            update_fields.append("TranscriptLLMResponse = ?")
            update_values.append(transcript_llm_response)
        
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
        update_values.extend([service_order_id, employee_id])
        
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
                    "service_order_id": service_order_id,
                    "employee_id": employee_id,
                    "rows_affected": rows_affected,
                    "updated_fields": [field.split(' = ')[0] for field in update_fields]
                }
            }
            print(f"✅ Successfully updated evaluation schedule for ServiceOrderID: {service_order_id}, EmployeeID: {employee_id}")
        else:
            response = {
                "status": "error",
                "message": f"No evaluation schedule record found with ServiceOrderID: {service_order_id} and EmployeeID: {employee_id}",
                "data": {
                    "service_order_id": service_order_id,
                    "employee_id": employee_id,
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
                "service_order_id": service_order_id,
                "employee_id": employee_id
            }
        }
    
    return response

    
 

