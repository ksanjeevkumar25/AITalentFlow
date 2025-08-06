using System.Collections.Generic;

namespace AIInterviewer.Core.Models;

public class InterviewQuestion
{
    public string Skill { get; set; } = "";
    public string Question { get; set; } = "";
    public List<string> Choices { get; set; } = new();
    public int CorrectChoiceIndex { get; set; }
    public string? FollowUp { get; set; }
    public string? RequiredSkillLevel { get; set; }
    public string? JobRole { get; set; }
    
    public bool IsSkillLevelMatched(SkillLevel skillLevel)
    {
        return RequiredSkillLevel == skillLevel.ToString();
    }
}