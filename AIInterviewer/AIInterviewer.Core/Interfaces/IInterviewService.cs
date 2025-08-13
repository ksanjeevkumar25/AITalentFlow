using AIInterviewer.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AIInterviewer.Core.Interfaces
{
    public interface IInterviewService
    {
        Task<InterviewSession> StartInterviewAsync(int candidateId, string candidateName, string skill, SkillLevel expertLevel, int countOfQuestions);
        Task<InterviewSession> SubmitAnswerAndGetNextAsync(int candidateId, int selectedChoice);
        Task<List<QaPair>> GenerateAnswers(string inputText);
        Task<List<string>> ExtractSkillsFromResumeAsync(int candidateId);

        Task<List<string>> ExtractSkillsFromResumeTextAsync(string resumeText);
        //Task<List<string>> ExtractSkillsFromTextAsync(string resumeText);
    }
}