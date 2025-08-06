using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoginApp.Models
{
    [Table("Skill")]
    public class Skill
    {
        [Key]
        [Column("SkillID")]
        public int SkillID { get; set; }
        
        [Required]
        [StringLength(255)]
        [Column("SkillName")]
        public string SkillName { get; set; } = string.Empty;
        
        [Column("SkillDescription")]
        public string? SkillDescription { get; set; }
    }
} 