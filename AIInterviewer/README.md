# AI Interviewer

## Overview
The AI Interviewer is a dynamic, skill-based application designed to conduct interviews using multiple-choice questions. It adapts to the candidate's skill level and job role, providing a tailored interview experience.

## Project Structure
The project is organized into several components:

- **AIInterviewer.Core**: Contains the core logic, including models, services, and interfaces.
- **AIInterviewer.API**: The web API that interacts with the core functionality, handling HTTP requests and responses.
- **AIInterviewer.Tests**: Unit tests to ensure the functionality of the core services.

## Setup Instructions

1. **Clone the Repository**
   ```
   git clone <repository-url>
   cd AIInterviewer
   ```

2. **Restore Dependencies**
   Use the following command to restore the necessary packages:
   ```
   dotnet restore
   ```

3. **Build the Solution**
   Build the project to ensure everything is set up correctly:
   ```
   dotnet build
   ```

4. **Run the API**
   Start the API to begin using the AI Interviewer:
   ```
   dotnet run --project AIInterviewer.API
   ```

## Usage Guidelines

- **Starting an Interview**: Send a POST request to `/api/interview/start` with the candidate's details.
- **Submitting Answers**: Send a POST request to `/api/interview/submit` with the candidate's answers.
- **Retrieving Questions**: The API will dynamically select questions based on the candidate's skill level and job role.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.