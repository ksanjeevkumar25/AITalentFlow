-- sample_queries.sql - Useful SQL queries for the Employees table

-- Basic employee information (corrected from user's request)
-- Original request: "select o	EmployeeID , o	FirstName, o	LastName, o	EmailID from emploee table"
-- Corrected query:
SELECT 
    EmployeeId,
    FirstName, 
    LastName, 
    Email
FROM Employees
ORDER BY EmployeeId;

-- Get all employee information
SELECT 
    Id,
    EmployeeId,
    FirstName,
    LastName,
    Email,
    Department,
    Position,
    Salary,
    HireDate,
    Status
FROM Employees
ORDER BY Id;

-- Get employees by department
SELECT 
    EmployeeId,
    FirstName,
    LastName,
    Email,
    Department,
    Position
FROM Employees
WHERE Department = 'Engineering'
ORDER BY FirstName, LastName;

-- Get active employees only
SELECT 
    EmployeeId,
    FirstName,
    LastName,
    Email,
    Department,
    Position,
    HireDate
FROM Employees
WHERE Status = 'Active'
ORDER BY HireDate DESC;

-- Count employees by department
SELECT 
    Department,
    COUNT(*) as EmployeeCount
FROM Employees
WHERE Status = 'Active'
GROUP BY Department
ORDER BY EmployeeCount DESC;

-- Get employees hired in the last year
SELECT 
    EmployeeId,
    FirstName,
    LastName,
    Email,
    Department,
    Position,
    HireDate
FROM Employees
WHERE HireDate >= DATEADD(year, -1, GETDATE())
    AND Status = 'Active'
ORDER BY HireDate DESC;

-- Search employees by name (example with LIKE)
SELECT 
    EmployeeId,
    FirstName,
    LastName,
    Email,
    Department,
    Position
FROM Employees
WHERE (FirstName LIKE '%John%' OR LastName LIKE '%John%')
    AND Status = 'Active'
ORDER BY FirstName, LastName; 