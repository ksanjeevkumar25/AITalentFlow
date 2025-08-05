# Priority Matching List Feature Documentation

## Overview
The Priority Matching List feature allows employees to view service orders that they are matched with based on their skills, grade, and other criteria. This feature integrates with the existing `PriorityMatchingList` table and provides a user-friendly interface for employees to indicate their willingness to work on specific service orders.

## Database Integration

### Tables Used
1. **PriorityMatchingList** - Main table containing matching records
2. **ServiceOrders** - Service order details with proper column structure
3. **Employees** - Employee information for grade matching

### Key Features
- **Grade Matching**: Only shows service orders where employee grade matches required grade
- **Availability Filter**: Only shows unassigned service orders (AssignedToResource IS NULL)
- **Priority Ranking**: Orders displayed by priority and matching score

## API Endpoints

### 1. Get Priority Matchings by Email
```
GET /priority-matching/email/:email
```
**Description**: Fetches priority matching records for the logged-in employee

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "MatchingListID": 1,
      "ServiceOrderID": 101,
      "EmployeeID": 5,
      "MatchingIndexScore": 85,
      "Remarks": "Good fit for technical skills",
      "Priority": 1,
      "AssociateWilling": null,
      "AccountName": "TechCorp Solutions",
      "Location": "New York",
      "CCARole": "Senior Developer",
      "HiringManager": 123,
      "RequiredFrom": "2025-08-15",
      "ClientEvaluation": "Looking for experienced developer",
      "SOState": "Open",
      "RequiredGrade": "L3",
      "EmployeeGrade": "L3"
    }
  ],
  "count": 1,
  "employee": {
    "id": 5,
    "name": "John Doe",
    "email": "john.doe@company.com"
  }
}
```

### 2. Update Associate Willingness
```
PUT /priority-matching/:matchingListId/willingness
```
**Body**:
```json
{
  "associateWilling": true
}
```

## Frontend Component Features

### UI Elements
1. **Navigation Tab**: "My Priority Matches" (🎯)
2. **Filter Options**: All, Willing, Not Willing, Pending
3. **Card-based Layout**: Similar to Service Orders with enhanced information
4. **Action Buttons**: "I'm Willing" and "Not Interested"

### Data Display
Each priority matching card shows:

#### Header Section
- **Role & Account**: CCA Role and Account Name
- **Location**: Geographic location with map pin icon
- **Badges**: Priority level, willingness status, matching score

#### Details Section
- **Role Information**: CCA Role, Account Name
- **Timeline**: Required From date
- **Requirements**: Grade required vs employee grade
- **State**: Current SO state

#### Remarks Section
- **Internal Remarks**: From PriorityMatchingList table
- **Client Evaluation**: From ServiceOrders table

#### Action Section
- **Willingness Buttons**: Toggle between willing/not willing
- **Visual Feedback**: Button states reflect current selection

### Color Coding

#### Priority Levels
- **High Priority (1-2)**: Red (#dc2626)
- **Medium Priority (3-4)**: Yellow (#f59e0b)
- **Low Priority (5+)**: Green (#10b981)

#### Matching Scores
- **High Score (80+)**: Green (#10b981)
- **Medium Score (60-79)**: Yellow (#f59e0b)
- **Low Score (<60)**: Red (#dc2626)

#### Willingness Status
- **Willing**: Green (#10b981)
- **Not Willing**: Red (#dc2626)
- **Pending**: Gray (#6b7280)

## Database Query Logic

### Filtering Conditions
```sql
WHERE pml.EmployeeID = @employeeId
  AND so.AssignedToResource IS NULL    -- Only unassigned orders
  AND so.Grade = emp.Grade             -- Grade matching
ORDER BY pml.Priority ASC, pml.MatchingIndexScore DESC
```

### Join Structure
- **PriorityMatchingList** ⟵ **ServiceOrders** (LEFT JOIN on ServiceOrderID)
- **PriorityMatchingList** ⟵ **Employees** (LEFT JOIN on EmployeeID)

## User Interaction Flow

1. **Login**: Employee logs into the system
2. **Navigation**: Click on "My Priority Matches" tab
3. **View Matches**: See all available service order matches
4. **Filter Results**: Use filter buttons to view specific willingness status
5. **Review Details**: Read service order information, client requirements
6. **Express Interest**: Click "I'm Willing" or "Not Interested"
7. **Status Update**: Changes are immediately reflected in the UI and database

## Error Handling

### Frontend
- **Loading States**: Spinner during data fetch
- **Error Messages**: Clear error display with retry option
- **Empty States**: Helpful message when no matches found

### Backend
- **Employee Validation**: Checks if employee exists with provided email
- **Grade Matching**: Ensures only appropriate matches are returned
- **Database Errors**: Proper error responses with meaningful messages

## Security Considerations

1. **Email-based Access**: Users can only see their own priority matches
2. **Input Validation**: All parameters validated before database queries
3. **SQL Injection Prevention**: Parameterized queries used throughout
4. **CORS Protection**: Configured for frontend-backend communication

## Future Enhancements

### Planned Features
1. **Real-time Notifications**: Alert when new matches are available
2. **Advanced Filtering**: Filter by location, account, role type
3. **Matching Algorithm**: Display why employee was matched (skill breakdown)
4. **Manager Dashboard**: Allow managers to see team member preferences
5. **Historical Data**: Track past assignments and performance

### Technical Improvements
1. **Caching**: Implement Redis caching for frequently accessed data
2. **Pagination**: Handle large numbers of matches efficiently
3. **Search**: Full-text search across service order details
4. **Export**: Allow employees to export their matches to PDF/Excel

## Testing Scenarios

### Test Cases
1. **Valid Employee**: Employee with matches in database
2. **No Matches**: Employee with no available matches
3. **Grade Mismatch**: Verify only grade-appropriate orders show
4. **Already Assigned**: Verify assigned orders don't appear
5. **Willingness Toggle**: Test updating willingness status
6. **Invalid Email**: Handle non-existent employee gracefully

### Data Setup
For testing, ensure:
- Sample employees with different grades
- Service orders with various grades and assignment states
- Priority matching records linking employees to orders
- Proper foreign key relationships

This feature significantly enhances the talent matching process by providing employees with visibility into available opportunities that match their qualifications and allowing them to express interest proactively.
