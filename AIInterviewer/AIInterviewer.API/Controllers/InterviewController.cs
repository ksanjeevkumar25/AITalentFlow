using AIInterviewer.Core.Interfaces;
using AIInterviewer.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

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

        public class NextQuestionRequest
        {
            public int CandidateId { get; set; }
            public int SelectedChoice { get; set; }
        }
    }
}