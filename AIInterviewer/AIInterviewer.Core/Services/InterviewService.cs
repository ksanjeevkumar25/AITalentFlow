using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIInterviewer.Core.Models;
using AIInterviewer.Core.Interfaces;
using System.Net.Http.Headers;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Linq;

namespace AIInterviewer.Core.Services
{
    public class InterviewService : IInterviewService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        // Sessions are tracked per candidate
        private static readonly Dictionary<int, InterviewSession> _sessions = new();

        public InterviewService(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        public async Task<InterviewSession> StartInterviewAsync(int candidateId, string candidateName, string skill, SkillLevel expertLevel, int countOfQuestions)
        {
            var session = new InterviewSession
            {
                CandidateName = candidateName,
                Skill = skill,
                ExpertLevel = expertLevel,
                CurrentQuestionNumber = 0,
                CountOfQuestions = countOfQuestions
            };
            session.CurrentQuestion = await GenerateMCQ(skill, expertLevel, session.CurrentQuestionNumber + 1);
            _sessions[candidateId] = session;
            return session;
        }

        public async Task<InterviewSession> SubmitAnswerAndGetNextAsync(int candidateId, int selectedChoice)
        {
            if (!_sessions.TryGetValue(candidateId, out var session) || session.CurrentQuestion == null)
                throw new InvalidOperationException("Invalid interview session or question.");

            session.Answers.Add((session.CurrentQuestion, selectedChoice));
            var skill = session.CurrentQuestion.Skill;
            if (!session.SkillScores.ContainsKey(skill))
                session.SkillScores[skill] = 0;

            if (selectedChoice == session.CurrentQuestion.CorrectChoiceIndex)
            {
                session.CorrectAnswers++;
                session.SkillScores[skill] += 10;
            }

            session.CurrentQuestionNumber++;

            if (session.CurrentQuestionNumber < session.CountOfQuestions)
            {
                // Use skill level from the first question for consistency
                SkillLevel skillLevel = session.CurrentQuestion.RequiredSkillLevel?.ToLower() switch
                {
                    "junior" => SkillLevel.Beginner,
                    "midlevel" => SkillLevel.Proficient,
                    "senior" => SkillLevel.Expert,
                    _ => SkillLevel.Beginner
                };
                session.CurrentQuestion = await GenerateMCQ(session.Skill, skillLevel, session.CurrentQuestionNumber);
            }
            else
            {
                session.CurrentQuestion = null;
            }
            return session;
        }

        // Update GenerateMCQ to use SkillLevel instead of experience
        private async Task<InterviewQuestion> GenerateMCQ(string skill, SkillLevel expertLevel, int questionNumber)
        {
            var prompt =
                $"You are an expert interviewer. Generate a {expertLevel}-level multiple-choice question (question #{questionNumber}) " +
                $"for a candidate in: {skill}. " +
                $"Focus this question on the skill: {skill}. " +
                $"Provide 4 choices, only one correct. Return JSON: question, choices (array of 4), correct_index (0-based).";
            var apiKey = _config["OpenAI:ApiKey"];
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var req = new
            {
                model = "gpt-4o",
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.2,
                response_format = new { type = "json_object" }
            };

            var content = new StringContent(JsonSerializer.Serialize(req), System.Text.Encoding.UTF8, "application/json");
            var resp = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
            var json = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
            {
                throw new Exception($"OpenAI API error: {resp.StatusCode} - {json}");
            }

            using var doc = JsonDocument.Parse(json);

            try
            {
                var choices = doc.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() == 0)
                    throw new Exception("No choices returned from OpenAI.");

                var message = choices[0].GetProperty("message");
                var content1 = message.GetProperty("content").GetString();

                if (string.IsNullOrWhiteSpace(content1))
                    throw new Exception("No content in OpenAI response.");

                // Now parse the content as JSON
                using var doc2 = JsonDocument.Parse(content1);
                var choicesList = new List<string>();
                foreach (var x in doc2.RootElement.GetProperty("choices").EnumerateArray())
                    choicesList.Add(x.GetString() ?? "");

                return new InterviewQuestion
                {
                    Skill = skill,
                    Question = doc2.RootElement.GetProperty("question").GetString() ?? "",
                    Choices = choicesList,
                    CorrectChoiceIndex = doc2.RootElement.GetProperty("correct_index").GetInt32()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing OpenAI response: " + ex.Message);
                throw;
            }
        }


        public async Task<List<QaPair>> GenerateAnswers(string input)
        {
            var systemPrompt = "You are a helpful assistant that extracts all question–answer pairs from the given text. Return the output strictly as JSON array of objects with 'question' and 'answer' properties. For each answer, evaluate if it is correct and add a boolean property 'isCorrect'. Ignore all unwanted text (useless conversation).";
            var apiKey = _config["OpenAI:ApiKey"];
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var req = new
            {
                model = "gpt-4o",
                messages = new[]
            {
            new { role = "system", content = systemPrompt },
            new { role = "user", content = input }
            },
                temperature = 0.2
            };


            var content = new StringContent(JsonSerializer.Serialize(req), System.Text.Encoding.UTF8, "application/json");
            var resp = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
            var json = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
            {
                throw new Exception($"OpenAI API error: {resp.StatusCode} - {json}");
            }

            using var doc = JsonDocument.Parse(json);

            try
            {
                var choices = doc.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() == 0)
                    throw new Exception("No choices returned from OpenAI.");

                var message = choices[0].GetProperty("message");
                var contentStr = message.GetProperty("content").GetString();

                contentStr = contentStr.Trim();

                if (contentStr.StartsWith("```json"))
                {
                    contentStr = contentStr.Replace("```json", "").Trim();
                }
                if (contentStr.EndsWith("```"))
                {
                    contentStr = contentStr.Substring(0, contentStr.LastIndexOf("```")).Trim();
                }

                // Step 2: Deserialize to a list
                var qaList = JsonSerializer.Deserialize<List<QaPair>>(contentStr, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return qaList != null ? qaList  : new List<QaPair>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing OpenAI response: " + ex.Message);
                throw;
            }
        }

        public async Task<List<QaPair>> GenerateAnswerMistralai(string input)
        {
            var systemPrompt = "You are a helpful assistant that extracts all question–answer pairs from the given text. Return the output strictly as JSON array of objects with 'question', 'answer', and 'isCorrect' properties. Ignore all unwanted text (useless conversation).";
            var apiKey = _config["Mistralai:ApiKey"]; // Add this to your appsettings.json
            var baseUrl = _config["Mistralai:BaseUrl"] ?? "https://api.mistral.ai/v1/chat/completions";
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var req = new
            {
                model = "mistral-large-latest", // Use the correct Mistralai model name
                messages = new[]
                {
            new { role = "system", content = systemPrompt },
            new { role = "user", content = input }
        },
                temperature = 0.2
            };

            var content = new StringContent(JsonSerializer.Serialize(req), System.Text.Encoding.UTF8, "application/json");
            var resp = await client.PostAsync(baseUrl, content);
            var json = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
            {
                throw new Exception($"Mistralai API error: {resp.StatusCode} - {json}");
            }

            using var doc = JsonDocument.Parse(json);

            try
            {
                var choices = doc.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() == 0)
                    throw new Exception("No choices returned from Mistralai.");

                var message = choices[0].GetProperty("message");
                var contentStr = message.GetProperty("content").GetString();

                contentStr = contentStr.Trim();

                if (contentStr.StartsWith("```json"))
                {
                    contentStr = contentStr.Replace("```json", "").Trim();
                }
                if (contentStr.EndsWith("```"))
                {
                    contentStr = contentStr.Substring(0, contentStr.LastIndexOf("```")).Trim();
                }

                var qaList = JsonSerializer.Deserialize<List<QaPair>>(contentStr, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return qaList != null ? qaList : new List<QaPair>();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing Mistralai response: " + ex.Message);
                throw;
            }
        }

        private List<string> GetSkillsForJobRole(string jobRole)
        {
            // Simple static mapping for demo
            if (jobRole.Contains("Python", StringComparison.OrdinalIgnoreCase))
                return new List<string> { "Python", "Django", "AsyncIO", "Unit Testing", "GIL" };
            if (jobRole.Contains("Java", StringComparison.OrdinalIgnoreCase))
                return new List<string> { "Java", "Spring Boot", "JVM", "Concurrency", "Streams" };
            // Add more mappings as needed
            return new List<string> { "Problem Solving", "Algorithms", "System Design" };
        }

        
    }

   
}