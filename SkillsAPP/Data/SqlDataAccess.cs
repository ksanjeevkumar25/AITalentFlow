using System.Data;
using Microsoft.Data.SqlClient;
using LoginApp.Models;
using System.Collections.Generic;

namespace LoginApp.Data
{
    public class SqlDataAccess
    {
        private readonly string _connectionString = "Server=20.0.97.202\\SQLDemo;Database=TestDB;User Id=sa;Password=Sanjeev@1234;TrustServerCertificate=True;";

        // Skill CRUD
        public List<Skill> GetSkills()
        {
            var skills = new List<Skill>();
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT SkillID, SkillName, SkillDescription FROM Skill ORDER BY SkillName", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        skills.Add(new Skill
                        {
                            SkillID = reader.GetInt32(0),
                            SkillName = reader.GetString(1),
                            SkillDescription = reader.IsDBNull(2) ? null : reader.GetString(2)
                        });
                    }
                }
            }
            return skills;
        }

        //Get All pending reportee skills for a supervisor to approve
        public List<EmployeeSkills> GetAllReportingEmployeeSkills(int employeeId)
        {
            var list = new List<EmployeeSkills>();
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(@"
                SELECT es.*, e.FirstName, e.LastName
                FROM EmployeeSkills es
                INNER JOIN Employee e ON es.EmployeeID = e.EmployeeID
                WHERE es.EmployeeID IN (SELECT [EmployeeID] FROM [Employee] WHERE [SupervisorID] = @EmployeeID)
            ", conn))
            {
                cmd.Parameters.AddWithValue("@EmployeeID", employeeId);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new EmployeeSkills
                        {
                            EmployeeSkillID = reader.GetInt32(reader.GetOrdinal("EmployeeSkillID")),
                            EmployeeID = reader.GetInt32(reader.GetOrdinal("EmployeeID")),
                            SkillID = reader.GetInt32(reader.GetOrdinal("SkillID")),
                            EmployeeRatedSkillLevel = reader["EmployeeRatedSkillLevel"] as int?,
                            EmployeeSkillModifiedDate = reader["EmployeeSkillModifiedDate"] as DateTime?,
                            YearsOfExperience = reader["YearsOfExperience"] as int?,
                            SupervisorRatedSkillLevel = reader["SupervisorRatedSkillLevel"] as int?,
                            SupervisorRatingUpdatedOn = reader["SupervisorRatingUpdatedOn"] as DateTime?,
                            AIEvaluatedScore = reader["AIEvaluatedScore"] as int?,
                            AIEvaluationDate = reader["AIEvaluationDate"] as DateTime?,
                            AIEvaluationRemarks = reader["AIEvaluationRemarks"] as string,
                            EmployeeLastWorkedOnThisSkill = reader["EmployeeLastWorkedOnThisSkill"] as DateTime?,
                            FirstName = reader["FirstName"] as string,
                            LastName = reader["LastName"] as string
                        });
                    }
                }
            }
            return list;
        }

        // EmployeeSkills CRUD
        public List<EmployeeSkills> GetEmployeeSkills(int employeeId)
        {
            var list = new List<EmployeeSkills>();
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT * FROM EmployeeSkills WHERE EmployeeID = @EmployeeID", conn))
            {
                cmd.Parameters.AddWithValue("@EmployeeID", employeeId);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new EmployeeSkills
                        {
                            EmployeeSkillID = reader.GetInt32(reader.GetOrdinal("EmployeeSkillID")),
                            EmployeeID = reader.GetInt32(reader.GetOrdinal("EmployeeID")),
                            SkillID = reader.GetInt32(reader.GetOrdinal("SkillID")),
                            EmployeeRatedSkillLevel = reader["EmployeeRatedSkillLevel"] as int?,
                            EmployeeSkillModifiedDate = reader["EmployeeSkillModifiedDate"] as DateTime?,
                            YearsOfExperience = reader["YearsOfExperience"] as int?,
                            SupervisorRatedSkillLevel = reader["SupervisorRatedSkillLevel"] as int?,
                            SupervisorRatingUpdatedOn = reader["SupervisorRatingUpdatedOn"] as DateTime?,
                            AIEvaluatedScore = reader["AIEvaluatedScore"] as int?,
                            AIEvaluationDate = reader["AIEvaluationDate"] as DateTime?,
                            AIEvaluationRemarks = reader["AIEvaluationRemarks"] as string,
                            EmployeeLastWorkedOnThisSkill = reader["EmployeeLastWorkedOnThisSkill"] as DateTime?
                        });
                    }
                }
            }
            return list;
        }

        // Create employee skill when employee logged in
        public void InsertEmployeeSkill(EmployeeSkills skill)
        {
            // Get the next EmployeeSkillID
            int nextId = GetMaxEmployeeSkillID() + 1;

            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(@"
        INSERT INTO EmployeeSkills (
            EmployeeSkillID, EmployeeID, SkillID, EmployeeRatedSkillLevel, EmployeeSkillModifiedDate, 
            YearsOfExperience, SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn, 
            AIEvaluatedScore, AIEvaluationDate, AIEvaluationRemarks, EmployeeLastWorkedOnThisSkill
        ) VALUES (
            @EmployeeSkillID, @EmployeeID, @SkillID, @EmployeeRatedSkillLevel, @EmployeeSkillModifiedDate, 
            @YearsOfExperience, @SupervisorRatedSkillLevel, @SupervisorRatingUpdatedOn, 
            @AIEvaluatedScore, @AIEvaluationDate, @AIEvaluationRemarks, @EmployeeLastWorkedOnThisSkill
        )", conn))
            {
                cmd.Parameters.AddWithValue("@EmployeeSkillID", nextId);
                cmd.Parameters.AddWithValue("@EmployeeID", skill.EmployeeID);
                cmd.Parameters.AddWithValue("@SkillID", skill.SkillID);
                cmd.Parameters.AddWithValue("@EmployeeRatedSkillLevel", (object?)skill.EmployeeRatedSkillLevel ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@EmployeeSkillModifiedDate", (object?)skill.EmployeeSkillModifiedDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@YearsOfExperience", (object?)skill.YearsOfExperience ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@SupervisorRatedSkillLevel", (object?)skill.SupervisorRatedSkillLevel ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@SupervisorRatingUpdatedOn", (object?)skill.SupervisorRatingUpdatedOn ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@AIEvaluatedScore", (object?)skill.AIEvaluatedScore ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@AIEvaluationDate", (object?)skill.AIEvaluationDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@AIEvaluationRemarks", (object?)skill.AIEvaluationRemarks ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@EmployeeLastWorkedOnThisSkill", (object?)skill.EmployeeLastWorkedOnThisSkill ?? DBNull.Value);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }


        // Update employee skill when employee logged in
        public void UpdateEmployeeSkill(EmployeeSkills skill)
        {
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(@"UPDATE EmployeeSkills SET EmployeeRatedSkillLevel=@EmployeeRatedSkillLevel, YearsOfExperience=@YearsOfExperience, EmployeeLastWorkedOnThisSkill=@EmployeeLastWorkedOnThisSkill, EmployeeSkillModifiedDate=@EmployeeSkillModifiedDate, SupervisorRatedSkillLevel = @SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn = @SupervisorRatingUpdatedOn WHERE EmployeeID=@EmployeeID AND SkillID=@SkillID", conn))
            {
                cmd.Parameters.AddWithValue("@EmployeeID", skill.EmployeeID);
                cmd.Parameters.AddWithValue("@SkillID", skill.SkillID);
                cmd.Parameters.AddWithValue("@EmployeeRatedSkillLevel", (object?)skill.EmployeeRatedSkillLevel ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@YearsOfExperience", (object?)skill.YearsOfExperience ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@EmployeeLastWorkedOnThisSkill", (object?)skill.EmployeeLastWorkedOnThisSkill ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@EmployeeSkillModifiedDate", (object?)skill.EmployeeSkillModifiedDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@SupervisorRatedSkillLevel", DBNull.Value);
                cmd.Parameters.AddWithValue("@SupervisorRatingUpdatedOn", DBNull.Value);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        // Update supervisor rating for an employee skill
        public void UpdateSupervisorRating(int employeeId, int skillId, int supervisorRatedSkillLevel, DateTime supervisorRatingUpdatedOn)
        {
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(@"UPDATE EmployeeSkills SET SupervisorRatedSkillLevel=@SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn=@SupervisorRatingUpdatedOn  WHERE EmployeeID=@EmployeeID AND SkillID=@SkillID", conn))
            {
                cmd.Parameters.AddWithValue("@EmployeeID", employeeId);
                cmd.Parameters.AddWithValue("@SkillID", skillId);
                cmd.Parameters.AddWithValue("@SupervisorRatedSkillLevel", supervisorRatedSkillLevel);
                cmd.Parameters.AddWithValue("@SupervisorRatingUpdatedOn", supervisorRatingUpdatedOn);
      
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        // UserSkill CRUD
        public List<UserSkill> GetUserSkills(string userName)
        {
            var list = new List<UserSkill>();
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT * FROM UserSkills WHERE UserName = @UserName", conn))
            {
                cmd.Parameters.AddWithValue("@UserName", userName);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new UserSkill
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("Id")),
                            UserName = reader.GetString(reader.GetOrdinal("UserName")),
                            SkillId = reader.GetInt32(reader.GetOrdinal("SkillId")),
                            Rating = reader.GetString(reader.GetOrdinal("Rating")),
                            CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                            UpdatedDate = reader["UpdatedDate"] as DateTime?
                        });
                    }
                }
            }
            return list;
        }

        public void InsertUserSkill(UserSkill skill)
        {
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(@"INSERT INTO UserSkills (UserName, SkillId, Rating, CreatedDate, UpdatedDate) VALUES (@UserName, @SkillId, @Rating, @CreatedDate, @UpdatedDate)", conn))
            {
                cmd.Parameters.AddWithValue("@UserName", skill.UserName);
                cmd.Parameters.AddWithValue("@SkillId", skill.SkillId);
                cmd.Parameters.AddWithValue("@Rating", skill.Rating);
                cmd.Parameters.AddWithValue("@CreatedDate", skill.CreatedDate);
                cmd.Parameters.AddWithValue("@UpdatedDate", (object?)skill.UpdatedDate ?? DBNull.Value);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public void UpdateUserSkill(UserSkill skill)
        {
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(@"UPDATE UserSkills SET Rating=@Rating, UpdatedDate=@UpdatedDate WHERE Id=@Id", conn))
            {
                cmd.Parameters.AddWithValue("@Id", skill.Id);
                cmd.Parameters.AddWithValue("@Rating", skill.Rating);
                cmd.Parameters.AddWithValue("@UpdatedDate", (object?)skill.UpdatedDate ?? DBNull.Value);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        public int GetMaxEmployeeSkillID()
        {
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT ISNULL(MAX(EmployeeSkillID), 0) FROM EmployeeSkills", conn))
            {
                conn.Open();
                return (int)cmd.ExecuteScalar();
            }
        }
        //public void SetSupervisorRatingNull(int employeeId, int skillId)
        //{
        //    using (var conn = new SqlConnection(_connectionString))
        //    using (var cmd = new SqlCommand(@"UPDATE EmployeeSkills 
        //        SET SupervisorRatedSkillLevel = @SupervisorRatedSkillLevel, SupervisorRatingUpdatedOn = @SupervisorRatingUpdatedOn 
        //        WHERE EmployeeID = @EmployeeID AND SkillID = @SkillID", conn))
        //    {
        //        cmd.Parameters.AddWithValue("@SupervisorRatedSkillLevel", DBNull.Value);
        //        cmd.Parameters.AddWithValue("@SupervisorRatingUpdatedOn", DBNull.Value);
        //        cmd.Parameters.AddWithValue("@EmployeeID", employeeId);
        //        cmd.Parameters.AddWithValue("@SkillID", skillId);
        //        conn.Open();
        //        cmd.ExecuteNonQuery();
        //    }
        //}

        // Authentication methods
        public Employee? ValidateUserLogin(string emailId, string password)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                var query = @"
                    SELECT e.EmployeeID, e.EmailID, e.FirstName, e.LastName, e.SupervisorID
                    FROM Employee e
                    INNER JOIN Users u ON e.EmployeeID = u.EmployeeID
                    WHERE e.EmailID = @EmailID AND u.Password = @Password";

                using (var cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@EmailID", emailId);
                    cmd.Parameters.AddWithValue("@Password", password);
                    
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new Employee
                            {
                                EmployeeID = reader.GetInt32("EmployeeID"),
                                EmailID = reader.GetString("EmailID"),
                                FirstName = reader.IsDBNull("FirstName") ? null : reader.GetString("FirstName"),
                                LastName = reader.IsDBNull("LastName") ? null : reader.GetString("LastName"),
                                // Department = reader.IsDBNull("Department") ? null : reader.GetString("Department"),
                                SupervisorID = reader.IsDBNull("SupervisorID") ? null : reader.GetInt32("SupervisorID")
                            };
                        }
                    }
                }
            }
            return null;
        }

        public Employee? GetEmployeeByEmailId(string emailId)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                var query = @"
                    SELECT EmployeeID, EmailID, FirstName, LastName, SupervisorID
                    FROM Employee
                    WHERE EmailID = @EmailID";

                using (var cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@EmailID", emailId);
                    
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new Employee
                            {
                                EmployeeID = reader.GetInt32("EmployeeID"),
                                EmailID = reader.GetString("EmailID"),
                                FirstName = reader.IsDBNull("FirstName") ? null : reader.GetString("FirstName"),
                                LastName = reader.IsDBNull("LastName") ? null : reader.GetString("LastName"),
                                // Department = reader.IsDBNull("Department") ? null : reader.GetString("Department"),
                                SupervisorID = reader.IsDBNull("SupervisorID") ? null : reader.GetInt32("SupervisorID")
                            };
                        }
                    }
                }
            }
            return null;
        }

        public bool IsUserAdmin(int employeeId)
        {
            // Return true if the employee has reportees (is a supervisor)
            using (var conn = new SqlConnection(_connectionString))
            {
                var query = @"
                    SELECT COUNT(*) 
                    FROM Employee 
                    WHERE SupervisorID = @EmployeeID";

                using (var cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@EmployeeID", employeeId);
                    conn.Open();
                    var count = (int)cmd.ExecuteScalar();
                    return count > 0;
                }
            }
        }
    }
}
