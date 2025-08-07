using AIInterviewer.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AIInterviewer.Core.Interfaces
{
    public interface IOpenAiService
    {
        Task<List<QaPair>> ExtractQuestionsAndAnswersAsync(string inputText);
    }
}