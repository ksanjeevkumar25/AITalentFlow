-- DML_TestDB_Insert.sql
-- Sample INSERT scripts for all tables in TestDB

USE [TestDB]
GO

-- Employee
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (1, 'Jane', 'Smith', NULL, 'jane.smith@company.com', '2022-01-01', 'A', 'Bangalore', 'Bangalore', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (2, 'Tom', 'Wilson', 1, 'tom.wilson@company.com', '2022-02-01', 'B', 'Chennai', 'Chennai', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (3, 'Emily', 'Davis', 1, 'emily.davis@company.com', '2022-03-01', 'A', 'Delhi', 'Delhi', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (4, 'Alex', 'Rodriguez', 2, 'alex.rodriguez@company.com', '2022-04-01', 'B', 'Mumbai', 'Mumbai', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (5, 'Sarah', 'Lee', 1, 'sarah.lee@company.com', '2022-05-01', 'C', 'Pune', 'Pune', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (6, 'Mike', 'Johnson', 3, 'mike.johnson@company.com', '2022-06-01', 'A', 'Hyderabad', 'Hyderabad', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (7, 'Lisa', 'Wang', 4, 'lisa.wang@company.com', '2022-07-01', 'B', 'Chennai', 'Chennai', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (8, 'David', 'Brown', 5, 'david.brown@company.com', '2022-08-01', 'C', 'Bangalore', 'Bangalore', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (9, 'Maria', 'Garcia', 6, 'maria.garcia@company.com', '2022-09-01', 'A', 'Delhi', 'Delhi', 1);
INSERT INTO [dbo].[Employee] (EmployeeID, FirstName, LastName, SupervisorID, EmailID, DateofJoin, Grade, Location, LocationPreference, AvailableForDeployment)
VALUES (10, 'Robert', 'Johnson', 7, 'robert.johnson@company.com', '2022-10-01', 'B', 'Mumbai', 'Mumbai', 1);

-- Skill
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (1, 'Java', 'Java programming language');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (2, 'React', 'React frontend framework');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (3, 'Python', 'Python programming language');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (4, 'SQL', 'SQL database language');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (5, 'Azure', 'Azure cloud platform');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (6, 'Docker', 'Containerization tool');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (7, 'Kubernetes', 'Container orchestration');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (8, 'C#', 'C# programming language');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (9, 'JavaScript', 'JavaScript language');
INSERT INTO [dbo].[Skill] (SkillID, SkillName, SkillDescription)
VALUES (10, 'TypeScript', 'TypeScript superset');

-- EmployeeSkills
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (1, 1, 1, 5, '2023-01-01', 3, 4, '2023-01-02', 5, '2023-01-03', 'Excellent Java skills', '2023-01-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (2, 2, 2, 4, '2023-02-01', 2, 3, '2023-02-02', 4, '2023-02-03', 'Good React skills', '2023-02-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (3, 3, 3, 4, '2023-03-01', 2, 4, '2023-03-02', 5, '2023-03-03', 'Strong Python skills', '2023-03-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (4, 4, 4, 5, '2023-04-01', 3, 5, '2023-04-02', 4, '2023-04-03', 'Excellent SQL skills', '2023-04-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (5, 5, 5, 3, '2023-05-01', 1, 3, '2023-05-02', 3, '2023-05-03', 'Good Azure knowledge', '2023-05-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (6, 6, 6, 4, '2023-06-01', 2, 4, '2023-06-02', 4, '2023-06-03', 'Docker experience', '2023-06-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (7, 7, 7, 5, '2023-07-01', 3, 5, '2023-07-02', 5, '2023-07-03', 'Kubernetes expert', '2023-07-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (8, 8, 8, 3, '2023-08-01', 1, 3, '2023-08-02', 3, '2023-08-03', 'C# developer', '2023-08-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (9, 9, 9, 4, '2023-09-01', 2, 4, '2023-09-02', 4, '2023-09-03', 'JavaScript skills', '2023-09-01');
INSERT INTO [dbo].[EmployeeSkills] (EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill)
VALUES (10, 10, 10, 5, '2023-10-01', 3, 5, '2023-10-02', 5, '2023-10-03', 'TypeScript expert', '2023-10-01');

-- ServiceOrder
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (101, 'GlobalCorp Inc.', 'Bangalore', 'Tech Lead', 1, '2023-03-01', 'Excellent', 'Open', 2, 'A');
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (102, 'TechSolutions Ltd.', 'Chennai', 'Developer', 2, '2023-04-01', 'Good', 'Open', 3, 'B');
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (103, 'InnovateX Pvt. Ltd.', 'Delhi', 'Architect', 3, '2023-05-01', 'Excellent', 'Closed', 1, 'A');
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (104, 'CreativeAgency', 'Mumbai', 'Designer', 4, '2023-06-01', 'Average', 'Open', 4, 'C');
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (105, 'MarketLeaders Co.', 'Pune', 'Consultant', 5, '2023-07-01', 'Good', 'Open', 5, 'B');
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (106, 'FutureTech', 'Hyderabad', 'Data Scientist', 6, '2023-08-01', 'Excellent', 'Open', 6, 'A');
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (107, 'NextGen Solutions', 'Chennai', 'DevOps Engineer', 7, '2023-09-01', 'Good', 'Open', 7, 'B');
INSERT INTO [dbo].[ServiceOrder] (ServiceOrderID, AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade)
VALUES (108, 'EliteEnterprises', 'Bangalore', 'Project Manager', 8, '2023-10-01', 'Excellent', 'Open', 8, 'A');

-- ServiceOrderSkills
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (1, 101, 1, 1, 5);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (2, 101, 2, 0, 4);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (3, 102, 3, 1, 4);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (4, 102, 4, 0, 3);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (5, 103, 5, 1, 5);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (6, 103, 6, 0, 4);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (7, 104, 7, 1, 3);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (8, 104, 8, 0, 2);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (9, 105, 9, 1, 5);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (10, 105, 10, 0, 4);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (11, 106, 1, 1, 5);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (12, 106, 2, 0, 4);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (13, 107, 3, 1, 4);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (14, 107, 4, 0, 3);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (15, 108, 5, 1, 5);
INSERT INTO [dbo].[ServiceOrderSkills] (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
VALUES (16, 108, 6, 0, 4);

-- EvaluationScheduleStatus
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (101, 1, 2, NULL, 'Client1', NULL, 'client1@client.com', NULL, '2023-03-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Good performance', 'Selected', 'LLM response');
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (102, 2, 3, NULL, 'Client2', NULL, 'client2@client.com', NULL, '2023-04-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Average performance', 'Not Selected', 'LLM response');
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (103, 3, 4, NULL, 'Client3', NULL, 'client3@client.com', NULL, '2023-05-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Excellent performance', 'Selected', 'LLM response');
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (104, 4, 5, NULL, 'Client4', NULL, 'client4@client.com', NULL, '2023-06-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Below average performance', 'Not Selected', 'LLM response');
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (105, 5, 6, NULL, 'Client5', NULL, 'client5@client.com', NULL, '2023-07-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Good performance', 'Selected', 'LLM response');
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (106, 6, 7, NULL, 'Client6', NULL, 'client6@client.com', NULL, '2023-08-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Excellent performance', 'Selected', 'LLM response');
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (107, 7, 8, NULL, 'Client7', NULL, 'client7@client.com', NULL, '2023-09-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Good performance', 'Selected', 'LLM response');
INSERT INTO [dbo].[EvaluationScheduleStatus] (ServiceOrderID, EmployeeID, CognizantInterviewer1ID, CognizantInterviewer2ID, ClientInterviewerName1, ClientInterviewerName2, ClientInterviewerEmail1, ClientInterviewerEmail2, EvaluationDateTime, EvaluationDuration, EvaluationType, EvaluationTranscription, AudioRecording, AudioSavedAt, VideoRecording, VideoSavedAt, EvaluationFeedback, FinalStatus, TranscriptLLMResponse)
VALUES (108, 8, 9, NULL, 'Client8', NULL, 'client8@client.com', NULL, '2023-10-10 10:00', 60, 'Technical', 'Transcript text', 1, 'audio/path', 0, NULL, 'Outstanding performance', 'Selected', 'LLM response');

-- EmployeePerformance
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (1, 1, 2023, 5, 2, 'Outstanding performance');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (2, 2, 2023, 4, 1, 'Exceeds expectations');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (3, 3, 2023, 5, 2, 'Outstanding performance');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (4, 4, 2023, 3, 1, 'Meets expectations');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (5, 5, 2023, 2, 1, 'Below expectations');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (6, 6, 2023, 4, 2, 'Exceeds expectations');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (7, 7, 2023, 3, 1, 'Meets expectations');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (8, 8, 2023, 5, 2, 'Outstanding performance');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (9, 9, 2023, 4, 1, 'Exceeds expectations');
INSERT INTO [dbo].[EmployeePerformance] (EmployeePerformanceID, EmployeeID, Year, Rating, RatingGivenBy, Comments)
VALUES (10, 10, 2023, 5, 2, 'Outstanding performance');

-- Allocation
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (1, 101, 1, '2023-03-01', '2023-06-01', 100);
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (2, 102, 2, '2023-04-01', '2023-07-01', 100);
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (3, 103, 3, '2023-05-01', '2023-08-01', 100);
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (4, 104, 4, '2023-06-01', '2023-09-01', 100);
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (5, 105, 5, '2023-07-01', '2023-10-01', 100);
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (6, 106, 6, '2023-08-01', '2023-11-01', 100);
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (7, 107, 7, '2023-09-01', '2023-12-01', 100);
INSERT INTO [dbo].[Allocation] (AllocationID, ServiceOrderID, EmployeeID, AllocationStartDate, AllocationEndDate, PercentageOfAllocation)
VALUES (8, 108, 8, '2023-10-01', '2024-01-01', 100);

-- Grade
INSERT INTO [dbo].[Grade] (GradeID, Grade, GradeDescription)
VALUES (1, 'A', 'Top performer');
INSERT INTO [dbo].[Grade] (GradeID, Grade, GradeDescription)
VALUES (2, 'B', 'Above average performer');
INSERT INTO [dbo].[Grade] (GradeID, Grade, GradeDescription)
VALUES (3, 'C', 'Average performer');
INSERT INTO [dbo].[Grade] (GradeID, Grade, GradeDescription)
VALUES (4, 'D', 'Below average performer');
INSERT INTO [dbo].[Grade] (GradeID, Grade, GradeDescription)
VALUES (5, 'E', 'Poor performer');

-- PriorityMatchingList
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (101, 1, 95, 'High match', 1, 1);
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (102, 2, 85, 'Medium match', 2, 1);
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (103, 3, 90, 'High match', 1, 1);
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (104, 4, 70, 'Low match', 3, 0);
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (105, 5, 80, 'Medium match', 2, 1);
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (106, 6, 75, 'Medium match', 2, 1);
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (107, 7, 65, 'Low match', 3, 0);
INSERT INTO [dbo].[PriorityMatchingList] (ServiceOrderID, EmployeeID, MatchingIndexScore, Remarks, Priority, AssociateWilling)
VALUES (108, 8, 95, 'High match', 1, 1);

-- ResourceSkillsEvaluation
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Jane Smith', 1, 'A', 'Java', 90, 1, 'Bangalore');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Tom Wilson', 2, 'B', 'React', 85, 1, 'Chennai');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Emily Davis', 3, 'A', 'Python', 88, 1, 'Delhi');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Alex Rodriguez', 4, 'B', 'SQL', 82, 1, 'Mumbai');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Sarah Lee', 5, 'C', 'Azure', 75, 1, 'Pune');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Mike Johnson', 6, 'A', 'Docker', 92, 1, 'Hyderabad');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Lisa Wang', 7, 'B', 'Kubernetes', 80, 1, 'Chennai');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('David Brown', 8, 'C', 'C#', 78, 1, 'Bangalore');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Maria Garcia', 9, 'A', 'JavaScript', 85, 1, 'Delhi');
INSERT INTO [dbo].[ResourceSkillsEvaluation] (AssociateName, AssociateID, Grade, TechnicalSkills, EvaluationScore, IsAvailableInBench, AssociateLocation)
VALUES ('Robert Johnson', 10, 'B', 'TypeScript', 80, 1, 'Mumbai');

-- Users
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (1, 1, 1, 'password123', '2023-03-10 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (2, 1, 2, 'password456', '2023-03-11 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (3, 1, 3, 'password789', '2023-03-12 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (4, 1, 4, 'password321', '2023-03-13 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (5, 1, 5, 'password654', '2023-03-14 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (6, 1, 6, 'password987', '2023-03-15 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (7, 1, 7, 'password147', '2023-03-16 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (8, 1, 8, 'password258', '2023-03-17 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (9, 1, 9, 'password369', '2023-03-18 09:00');
INSERT INTO [dbo].[Users] (UserID, Active, EmployeeID, Password, LoggedInTime)
VALUES (10, 1, 10, 'password159', '2023-03-19 09:00');

-- __EFMigrationsHistory
INSERT INTO [dbo].[__EFMigrationsHistory] (MigrationId, ProductVersion)
VALUES ('20230812_Initial', '6.0.0');
