using System.Collections.Generic;
using System.Linq;

namespace AIInterviewer.Core.Models;

public class InterviewSession
{
    public string CandidateName { get; set; } = "";
    public string Skill { get; set; }
    public SkillLevel ExpertLevel { get; set; } // Use enum for expert level
    public int CurrentQuestionNumber { get; set; } = 0;
    public InterviewQuestion? CurrentQuestion { get; set; }
    public List<(InterviewQuestion Question, int SelectedChoice)> Answers { get; set; } = new();
    public int CorrectAnswers { get; set; } = 0;
    public Dictionary<string, int> SkillScores { get; set; } = new Dictionary<string, int>();

    public int CountOfQuestions { get; set; }

    public string GetSkillScoreSummary()
    {
        return string.Join(System.Environment.NewLine, SkillScores.Select(kvp => $"{kvp.Key}: {kvp.Value}"));
    }

    public Dictionary<string, int> GetSkillScores() => new Dictionary<string, int>(SkillScores);
}