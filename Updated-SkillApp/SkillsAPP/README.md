# Repository Notes

## .gitignore
This project uses a comprehensive `.gitignore` to avoid committing sensitive or unnecessary files, including:
- User secrets and environment-specific config (e.g., `appsettings.Development.json`)
- Local user/IDE files (`*.user`, `*.suo`, `.vs/`, etc.)
- Build outputs (`bin/`, `obj/`, etc.)
- Uploaded resumes and extracted skills (`wwwroot/resumes/`, `wwwroot/skills/`)
- Test results, logs, and coverage reports

## Configuration
- The database connection string is stored in `appsettings.json` and read via dependency injection.
- Do not commit environment-specific config files or secrets to version control.

## Skills Management (Updated)
- Skills added via the UI are now saved both in the session (for immediate feedback) and persisted to the database.
- The Add Skill button uses a JavaScript onclick event for a smoother user experience.

## Running & Development
- Always run `dotnet clean` before `dotnet build` if you encounter build issues.
- Make sure to update your local `.gitignore` if you add new folders for uploads or logs.

# Login App

A simple ASP.NET Core web application with authentication functionality and skills management.

## Features

- **Login Screen as Default Landing Page** - Beautiful login page is the first screen users see
- Beautiful and modern login page with Bootstrap styling
- Cookie-based authentication
- Protected home page that requires login
- Logout functionality
- **Skills Management System** - Users can rate their skills (Beginner, Basic, Expert)
- **Resume Upload** - Upload PDF, DOC, or DOCX files
- **Database Integration** - SQL Server with Entity Framework Core
- Responsive design with gradient backgrounds
- Font Awesome icons for enhanced UI

## Authentication

The application uses database authentication with the following setup:

- **Login Method**: Use your company email address and password
- **User Data**: Stored in `Users` and `Employee` tables
- **Authentication Flow**: 
  1. Enter your email address (from Employee table)
  2. Enter your password (from Users table linked by EmployeeID)
  3. System validates credentials and determines user role
- **Admin Role**: Determined by employee hierarchy (employees with no supervisor)

## Database Tables

- **Employee Table**: Contains EmployeeID, EmailID, FirstName, LastName, Department, SupervisorID
- **Users Table**: Contains UserID, EmployeeID, Password
- **Authentication**: Email from Employee table + Password from Users table

## How to Run

1. Make sure you have .NET 8.0 SDK installed on your machine
2. Open a terminal in the project directory
3. Run the following commands:

```bash
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the application
dotnet run
```

4. Open your web browser and navigate to `http://localhost:5000`
5. **The login screen will be the first page you see**

## Database Setup

The application uses SQL Server with the following connection details:
- **Server:** 20.0.97.202\SQLDemo
- **Database:** TestDB
- **User:** sa
- **Password:** Sanjeev@1234

### Database Tables
- `Skills` - Stores available skills
- `UserSkills` - Tracks user skill ratings
- `__EFMigrationsHistory` - Entity Framework migration history

## Project Structure

```
LoginApp/
├── Controllers/
│   ├── AccountController.cs    # Handles login/logout functionality
│   ├── HomeController.cs       # Handles home page (requires authentication)
│   ├── ProfileController.cs    # Handles profile and skills management
│   └── AdminController.cs      # Admin functions for adding sample skills
├── Models/
│   ├── Skill.cs               # Skill entity model
│   └── UserSkill.cs           # User skill rating model
├── Data/
│   └── ApplicationDbContext.cs # Entity Framework DbContext
├── Views/
│   ├── Account/
│   │   ├── Login.cshtml       # Login page (default landing page)
│   │   └── AccessDenied.cshtml # Access denied page
│   ├── Home/
│   │   ├── Index.cshtml       # Welcome page after login
│   │   └── Error.cshtml       # Error page
│   └── Profile/
│       └── Index.cshtml       # Profile page with skills management
├── Program.cs                  # Application entry point
├── LoginApp.csproj            # Project file
├── appsettings.json           # Configuration with database connection
└── README.md                  # This file
```

## Authentication Flow

1. **User visits the application** → Login page is displayed
2. **User enters credentials** (demouser/test123)
3. **If valid** → User is authenticated and redirected to home page
4. **User can access profile** → Click on "User Profile" card
5. **Manage skills** → Rate skills as Beginner, Basic, or Expert
6. **Upload resume** → Upload PDF, DOC, or DOCX files
7. **User can logout** → Returns to login page

## Skills Management

### Adding Sample Skills
1. Login to the application
2. Visit: `http://localhost:5000/Admin/AddSampleSkills`
3. This adds 10 sample skills to the database

### Available Skills
- C#, ASP.NET Core, Entity Framework, SQL Server
- JavaScript, HTML/CSS, Bootstrap, Git
- Azure, Docker

### Rating System
- **Beginner** (Yellow badge) - Just starting to learn
- **Basic** (Blue badge) - Some experience
- **Expert** (Green badge) - Advanced knowledge

## Security Features

- Cookie-based authentication with expiration
- Protected routes using `[Authorize]` attribute
- Input validation and error handling
- Secure password handling (though hardcoded for demo purposes)
- File type validation for resume uploads

## Technologies Used

- ASP.NET Core 8.0
- C# 12
- Entity Framework Core 8.0
- SQL Server
- Bootstrap 5.3.0
- Font Awesome 6.0.0
- Cookie Authentication

## Notes

This is a demo application with hardcoded credentials. In a production environment, you should:

- Use a proper database for user management
- Hash passwords securely
- Implement proper session management
- Add additional security measures like HTTPS enforcement
- Use environment variables for sensitive configuration
- Implement proper user registration and password reset functionality 