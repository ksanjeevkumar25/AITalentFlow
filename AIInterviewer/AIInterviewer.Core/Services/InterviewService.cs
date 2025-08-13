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

                return qaList != null ? qaList : new List<QaPair>();
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

        public async Task<List<string>> ExtractSkillsFromResumeAsync(int candidateId)
        {
            // 1. Fetch resume text from DB (pseudo code, replace with your actual DB logic)
            string resumeText = await FetchResumeTextFromDbAsync(candidateId);
            if (string.IsNullOrWhiteSpace(resumeText))
                throw new Exception("Resume not found for candidate.");

            // 2. If resume is large, split into chunks (example: 4000 chars per chunk)
            var skillSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            int chunkSize = 4000;
            for (int i = 0; i < resumeText.Length; i += chunkSize)
            {
                string chunk = resumeText.Substring(i, Math.Min(chunkSize, resumeText.Length - i));
                var chunkSkills = await ExtractSkillsFromTextAsync(chunk);
                foreach (var skill in chunkSkills)
                    skillSet.Add(skill);
            }
            return skillSet.ToList();
        }

        public async Task<List<string>> ExtractSkillsFromResumeTextAsync(string resumeText)
        {
            // 1. Fetch resume text from DB (pseudo code, replace with your actual DB logic)
            //string resumeText = await FetchResumeTextFromDbAsync(candidateId);
            //if (string.IsNullOrWhiteSpace(resumeText))
            //    throw new Exception("Resume not found for candidate.");

            // 2. If resume is large, split into chunks (example: 4000 chars per chunk)
            var skillSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            int chunkSize = 4000;
            for (int i = 0; i < resumeText.Length; i += chunkSize)
            {
                string chunk = resumeText.Substring(i, Math.Min(chunkSize, resumeText.Length - i));
                var chunkSkills = await ExtractSkillsFromTextAsync(chunk);
                foreach (var skill in chunkSkills)
                    skillSet.Add(skill);
            }
            return skillSet.ToList();
        }

        // Helper: fetch resume from DB (replace with your actual DB code)
        private async Task<string> FetchResumeTextFromDbAsync(int candidateId)
        {
            // TODO: Replace this with actual DB fetch logic when DB is ready.
            // Example using Dapper or EF Core:
            // return await _dbContext.Candidates.Where(c => c.Id == candidateId).Select(c => c.ResumeText).FirstOrDefaultAsync();

            // For testing, return a sample resume text:
            return @"
John Doe
Senior Software Engineer

Summary:
Experienced software engineer with expertise in .NET, C#, Azure, and cloud-native development. Strong background in REST APIs, microservices, and DevOps practices.

Technical Skills:
- Programming Languages: C#, JavaScript, Python,Java, SAP ABAP
- Frameworks: .NET 6/7, ASP.NET Core, Entity Framework, React
- Cloud: Microsoft Azure (App Services, Azure Functions, Cosmos DB), AWS (EC2, Lambda)
- DevOps: Docker, Kubernetes, Azure DevOps, GitHub Actions
- Databases: SQL Server, PostgreSQL, MongoDB
- Other: REST APIs, Microservices, Unit Testing, Agile, Scrum

Professional Experience:
Software Engineer at TechCorp (2020–Present)
- Designed and implemented scalable microservices using ASP.NET Core and Azure.
- Automated CI/CD pipelines with Azure DevOps and Docker.
- Led migration of legacy .NET Framework apps to .NET 6.

Education:
B.Tech in Computer Science, XYZ University
";
        }

        // Helper: call LLM to extract skills from text
        private async Task<List<string>> ExtractSkillsFromTextAsync(string resumeText)
        {
            var systemPrompt = "You are an expert technical recruiter. Extract all technical skills from the following resume text. Return a JSON array of skill names only, no extra text.";
            var apiKey = _config["OpenAI:ApiKey"];
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var req = new
            {
                model = "gpt-4o",
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = resumeText }
                },
                temperature = 0.0,
                response_format = new { type = "json_object" }
            };

            var content = new StringContent(JsonSerializer.Serialize(req), System.Text.Encoding.UTF8, "application/json");
            var resp = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
            var json = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
                throw new Exception($"OpenAI API error: {resp.StatusCode} - {json}");

            using var doc = JsonDocument.Parse(json);
            var choices = doc.RootElement.GetProperty("choices");
            if (choices.GetArrayLength() == 0)
                throw new Exception("No choices returned from OpenAI.");

            var message = choices[0].GetProperty("message");
            var contentStr = message.GetProperty("content").GetString();

            // Clean up and parse the JSON array
            contentStr = contentStr.Trim();
            if (contentStr.StartsWith("```json"))
                contentStr = contentStr.Replace("```json", "").Trim();
            if (contentStr.EndsWith("```"))
                contentStr = contentStr.Substring(0, contentStr.LastIndexOf("```")).Trim();

            // Handle if the response is a JSON object with a property (e.g., { "skills": [...] })
            if (contentStr.StartsWith("{"))
            {
                using var wrapperDoc = JsonDocument.Parse(contentStr);
                if (wrapperDoc.RootElement.TryGetProperty("skills", out var skillsArray))
                {
                    return skillsArray.Deserialize<List<string>>(new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }) ?? new List<string>();
                }
                throw new Exception("Expected 'skills' property in response.");
            }
            // Handle if the response is a JSON array
            if (contentStr.StartsWith("["))
            {
                return JsonSerializer.Deserialize<List<string>>(contentStr, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<string>();
            }

            throw new Exception("OpenAI response is not a valid JSON array or object.");
        }

        //Task<List<string>> IInterviewService.ExtractSkillsFromTextAsync(string resumeText)
        //{
        //    return ExtractSkillsFromTextAsync(resumeText);
        //}
    }


}