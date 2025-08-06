using System;
using System.Collections.Generic;
using System.Linq;
using AIInterviewer.Core.Models;

namespace AIInterviewer.Core.Services
{
    public class QuestionSelector
    {
        private readonly List<InterviewQuestion> _questions;

        public QuestionSelector(List<InterviewQuestion> questions)
        {
            _questions = questions;
        }

        public List<InterviewQuestion> SelectQuestions(SkillLevel skillLevel, string jobRole, int numberOfQuestions)
        {
            var filteredQuestions = _questions
                .Where(q => q.RequiredSkillLevel != null && q.JobRole != null)
                .Where(q => q.RequiredSkillLevel == skillLevel.ToString() && q.JobRole == jobRole)
                .ToList();

            return filteredQuestions.OrderBy(q => Guid.NewGuid()).Take(numberOfQuestions).ToList();
        }
    }
}