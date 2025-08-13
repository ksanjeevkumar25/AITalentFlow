using AIInterviewer.Core.Interfaces;
using AIInterviewer.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace AIInterviewer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterviewController : ControllerBase
    {
        private readonly IInterviewService _service;
        private readonly IOpenAiService _openAiService;

        public InterviewController(IInterviewService service, IOpenAiService openAiService)
        {
            _service = service;
            _openAiService = openAiService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] StartInterviewRequest req)
        {
            var session = await _service.StartInterviewAsync(req.Id, req.Name, req.Skill, req.ExpertLevel, req.QuestionCount);
            return Ok(new
            {
                CurrentQuestion = session.CurrentQuestion,
                CurrentQuestionNumber = session.CurrentQuestionNumber,
                CorrectAnswers = session.CorrectAnswers
            });
        }

        [HttpPost("next")]
        public async Task<IActionResult> Next([FromBody] NextQuestionRequest request)
        {
            var session = await _service.SubmitAnswerAndGetNextAsync(request.CandidateId, request.SelectedChoice);
            return Ok(new
            {
                SkillScores = session.SkillScores,
                CurrentQuestion = session.CurrentQuestion,
                CorrectAnswers = session.CorrectAnswers
            });
        }

        [HttpPost("extract-qa")]
        public async Task<IActionResult> ExtractQa([FromBody] string inputText)
        {
            if (string.IsNullOrWhiteSpace(inputText))
                return BadRequest("Input text is required.");

            try
            {
                var qaPairs = await _service.GenerateAnswers(inputText);
                return Ok(qaPairs);
            }
            catch (System.Exception ex)
            {
                // Log error as needed
                return StatusCode(500, $"Error extracting Q&A pairs: {ex.Message}");
            }
        }

        [HttpPost("extract-skills")]
        public async Task<IActionResult> ExtractSkills([FromBody] int candidateId)
        {
            try
            {
                var skills = await _service.ExtractSkillsFromResumeAsync(candidateId);
                return Ok(skills);
            }
            catch (Exception ex)
            {
                // Log error as needed
                return StatusCode(500, $"Error extracting skills: {ex.Message}");
            }
        }

        [HttpPost("extract-skills-from-text")]
        public async Task<IActionResult> ExtractSkillsFromText([FromBody] string resumeText)
        {
            if (string.IsNullOrWhiteSpace(resumeText))
                return BadRequest("Resume text is required.");

            try
            {
                // Directly call the service method that extracts skills from text
                var skills = await _service.ExtractSkillsFromResumeTextAsync(resumeText);
                return Ok(skills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error extracting skills: {ex.Message}");
            }
        }

        public class NextQuestionRequest
        {
            public int CandidateId { get; set; }
            public int SelectedChoice { get; set; }
        }
    }
}