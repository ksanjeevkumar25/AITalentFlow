using System.ComponentModel.DataAnnotations;

namespace LoginApp.Models
{
    public class UserSkill
    {
        public int Id { get; set; }
        
        [Required]
        public string UserName { get; set; } = string.Empty;
        
        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;
        
        [Required]
        [StringLength(20)]
        public string Rating { get; set; } = string.Empty; // Beginner, Basic, Expert
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }
    }
} 