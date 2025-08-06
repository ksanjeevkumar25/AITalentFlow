using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoginApp.Models
{
    [Table("EmployeeSkills")]
    public class EmployeeSkills
    {
        [Key]
        [Column("EmployeeSkillID")]
        public int EmployeeSkillID { get; set; }
        
        [Column("EmployeeID")]
        public int EmployeeID { get; set; }
        
        [Column("SkillID")]
        public int SkillID { get; set; }
        
        [Column("EmployeeRatedSkillLevel")]
        public int? EmployeeRatedSkillLevel { get; set; }
        
        [Column("EmployeeSkillModifiedDate")]
        public DateTime? EmployeeSkillModifiedDate { get; set; }
        
        [Column("YearsOfExperience")]
        public int? YearsOfExperience { get; set; }
        
        [Column("SupervisorRatedSkillLevel")]
        public int? SupervisorRatedSkillLevel { get; set; }
        
        [Column("SupervisorRatingUpdatedOn")]
        public DateTime? SupervisorRatingUpdatedOn { get; set; }
        
        [Column("AIEvaluatedScore")]
        public int? AIEvaluatedScore { get; set; }
        
        [Column("AIEvaluationDate")]
        public DateTime? AIEvaluationDate { get; set; }
        
        [Column("AIEvaluationRemarks")]
        public string? AIEvaluationRemarks { get; set; }
        
        [Column("EmployeeLastWorkedOnThisSkill")]
        public DateTime? EmployeeLastWorkedOnThisSkill { get; set; }
        
        // Navigation property
        public Skill Skill { get; set; } = null!;

        [NotMapped]
        public string? FirstName { get; set; }
        [NotMapped]
        public string? LastName { get; set; }
    }
} 