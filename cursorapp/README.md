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

## Login Credentials

- **Username:** `demouser`
- **Password:** `test123`

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