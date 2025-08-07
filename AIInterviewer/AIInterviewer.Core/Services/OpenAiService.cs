using System.Text.Json;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using AIInterviewer.Core.Models;
using AIInterviewer.Core.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace AIInterviewer.Core.Services
{
    public class OpenAiService : IOpenAiService
    {
        private readonly HttpClient _openAiClient;

        public OpenAiService(HttpClient openAiClient)
        {
            _openAiClient = openAiClient;
        }

        public async Task<List<QaPair>> ExtractQuestionsAndAnswersAsync(string inputText)
        {
            var systemPrompt = "You are a helpful assistant that extracts all question–answer pairs from the given text. Return the output strictly as JSON array of objects with 'question' and 'answer' properties. For each answer, evaluate if it is correct and add a boolean property 'isCorrect'. Ignore all unwanted text (useless conversation).";
            var requestBody = new
            {
                model = "gpt-4o-mini",
                temperature = 0,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = inputText }
                },
                response_format = new { type = "json_object" }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _openAiClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode} - {error}");
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var choices = doc.RootElement.GetProperty("choices");
            if (choices.GetArrayLength() == 0)
                throw new Exception("No choices returned from OpenAI.");

            var message = choices[0].GetProperty("message");
            var contentStr = message.GetProperty("content").GetString();

            if (string.IsNullOrWhiteSpace(contentStr))
                throw new Exception("No content in OpenAI response.");

            var qaPairs = JsonSerializer.Deserialize<List<QaPair>>(contentStr, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return qaPairs ?? new List<QaPair>();
        }
    }
}