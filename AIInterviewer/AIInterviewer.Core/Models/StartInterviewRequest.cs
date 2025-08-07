using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIInterviewer.Core.Models
{
    public class StartInterviewRequest
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Skill { get; set; }
        public SkillLevel ExpertLevel { get; set; } // Use enum
        public int QuestionCount { get; set; }
    }
}
