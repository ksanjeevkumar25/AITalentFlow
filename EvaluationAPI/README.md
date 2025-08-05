# Interview API

A comprehensive FastAPI application for managing interviews, candidates, employees, and video analysis with audio transcription.

## Features

- 🎥 **Video Analysis**: Upload videos and get metadata analysis
- 🎤 **Audio Transcription**: Extract audio from videos and convert to text
- 👥 **Candidate Management**: Retrieve candidate information
- 👨‍💼 **Employee Management**: Connect to SQL Express database for employee data
- 🛡️ **Windows-Compatible**: Includes fixes for Windows audio module issues
- 🗂️ **Modular Design**: Separated database operations for better code organization

## Project Structure

```
InterviewAPI/
├── main.py                      # Main FastAPI application
├── database.py                  # Database operations and configuration
├── config_template.py           # Database credential configuration template
├── requirements.txt             # Python dependencies
├── create_employees_table.sql   # SQL script to create employee table
├── test_database.py            # Test script for database functionality
├── README.md                   # This file
└── venv/                       # Virtual environment (created during setup)
```

## Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd InterviewAPI
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup (Optional)

#### Option A: Use Mock Data
The API works out of the box with mock employee data if no database is configured.

#### Option B: Connect to SQL Express
1. Ensure SQL Server Express is installed and running
2. Run the provided SQL script to create the Employees table:
   ```bash
   sqlcmd -S localhost\SQLEXPRESS -i create_employees_table.sql
   ```
3. Update database configuration in `database.py` if needed:
   ```python
   DATABASE_CONFIG = {
       "server": "localhost\\SQLEXPRESS",
       "database": "your_database_name",
       "driver": "ODBC Driver 17 for SQL Server",
       "trusted_connection": "yes"
   }
   ```

### 4. Test Database Setup (Optional)
```bash
python test_database.py
```

## Usage

### Start the Server
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### 🏠 Basic Endpoints
- `GET /` - Welcome message
- `GET /system-status` - Check system status and library availability

### 👥 Data Management
- `GET /candidates` - Retrieve candidate list
- `GET /employees` - Retrieve employee list from SQL Express (with fallback to mock data)

### 🎥 Video Processing
- `POST /analyze-video` - Upload video file for analysis and transcription

## Response Examples

### Employees Endpoint
```json
{
  "employees": [
    {
      "id": 1,
      "employee_id": "EMP001",
      "first_name": "John",
      "last_name": "Smith",
      "email": "john.smith@company.com",
      "department": "Engineering",
      "position": "Software Engineer",
      "salary": 75000,
      "hire_date": "2023-01-15",
      "status": "Active"
    }
  ],
  "total": 1,
  "source": "sql_express_database"
}
```

### Video Analysis Endpoint
```json
{
  "status": "success",
  "file_info": {
    "filename": "interview.mp4",
    "size_mb": 15.2
  },
  "video_analysis": {
    "estimated_duration_seconds": 152.0,
    "format": "mp4"
  },
  "audio_analysis": {
    "transcription": {
      "success": true,
      "text": "Hello, this is the transcribed audio content...",
      "confidence": 0.85,
      "method": "google_speech_api"
    }
  }
}
```

## Database Configuration

### File: `database.py`
All database-related operations are contained in the `database.py` module:

- **Configuration**: `DATABASE_CONFIG` dictionary
- **Credentials**: `get_database_credentials()` function (supports environment variables)
- **Connection**: `get_database_connection()` function
- **Data Fetching**: `fetch_employees_from_database()` function
- **Testing**: `test_database_connection()` function
- **Mock Data**: `get_mock_employees()` function

### SQL Server Authentication Setup

The API supports both Windows Authentication and SQL Server Authentication. For the current setup (remote SQL Server), SQL Server authentication with username/password is required.

#### Option 1: Environment Variables (Recommended for Production)
```bash
# Windows
set DB_USERNAME=your_actual_username
set DB_PASSWORD=your_actual_password

# Linux/Mac
export DB_USERNAME=your_actual_username
export DB_PASSWORD=your_actual_password
```

#### Option 2: Configuration Template
1. Copy and modify `config_template.py`:
```python
os.environ["DB_USERNAME"] = "your_actual_username"
os.environ["DB_PASSWORD"] = "your_actual_password"
```
2. Run the configuration before starting the server

#### Option 3: Direct Configuration (Not Recommended for Production)
Update `DATABASE_CONFIG` in `database.py`:
```python
DATABASE_CONFIG = {
    "server": "20.0.97.202\\SQLDemo",
    "database": "VibeDB",
    "driver": "ODBC Driver 17 for SQL Server",
    "username": "your_actual_username",
    "password": "your_actual_password",
    "trusted_connection": "no"
}
```

### Connection String Format
The application builds connection strings in this format:
```
mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server
```

### Security Features
- **Environment Variable Support**: Credentials can be set via environment variables
- **Password Masking**: Passwords are never exposed in system status or logs
- **Fallback Options**: Multiple authentication methods supported
- **Error Handling**: Clear error messages guide proper credential setup

## System Requirements

### Required Dependencies
- Python 3.7+
- FastAPI
- Uvicorn
- SQLAlchemy
- pyodbc

### Optional Dependencies (for full audio processing)
- MoviePy (video processing)
- Pydub (audio processing)
- SpeechRecognition (speech-to-text)
- standard-aifc (Windows compatibility)

### Windows-Specific
- ODBC Driver 17 for SQL Server
- pywin32 (Windows system integration)

## Troubleshooting

### Audio Processing Issues
If you encounter `aifc` or `pyaudioop` module errors:
1. The API includes `standard-aifc` package to fix these issues
2. Falls back to mock transcription if audio libraries fail
3. All endpoints remain functional regardless of audio library status

### Database Connection Issues
1. Check SQL Server Express is running: `services.msc` → SQL Server (SQLEXPRESS)
2. Verify ODBC Driver is installed
3. Test connection string in SQL Server Management Studio
4. Run `python test_database.py` to check database connectivity
5. API provides mock employee data if database is unavailable

### Check System Status
Visit `http://localhost:8000/system-status` to see:
- Library availability
- Database connectivity
- Windows-specific fixes status
- Available features

## Development

### Adding New Database Operations
1. Add functions to `database.py`
2. Import required functions in `main.py`
3. Create new API endpoints as needed
4. Test with `test_database.py`

### Adding New Endpoints
1. Add route function to `main.py`
2. Include proper error handling
3. Update system status if needed
4. Test with both real and mock data scenarios

### Database Schema
Refer to `create_employees_table.sql` for the expected table structure.

## Testing

### Test Database Module
```bash
python test_database.py
```

This will test:
- Database library availability
- Connection status
- Mock data functionality
- Employee data fetching

### Test API Endpoints
1. Start the server: `uvicorn main:app --reload`
2. Visit: `http://localhost:8000/docs`
3. Test each endpoint using the interactive documentation

## Production Deployment

1. Use a production WSGI server like Gunicorn
2. Configure proper database credentials in `database.py`
3. Set up environment variables for sensitive data
4. Configure logging and monitoring
5. Use HTTPS with proper SSL certificates

## Module Dependencies

### main.py depends on:
- `database.py` (for employee data operations)
- Audio processing libraries (optional)
- Standard FastAPI dependencies

### database.py depends on:
- `pyodbc` (for SQL Server connectivity)
- `sqlalchemy` (for database operations)
- `fastapi` (for HTTP exception handling)

## Support

For issues or questions:
1. Check the system status endpoint first: `/system-status`
2. Run the database test: `python test_database.py`
3. Review console output for error messages
4. Ensure all dependencies are properly installed
5. Verify database connectivity if using SQL Express 