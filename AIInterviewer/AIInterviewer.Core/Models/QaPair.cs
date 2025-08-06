namespace AIInterviewer.Core.Models
{
    public class QaPair
    {
        public string Question { get; set; }
        public string Answer { get; set; }
        public bool IsCorrect { get; set; }
    }
}