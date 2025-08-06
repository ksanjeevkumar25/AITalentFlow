public class NextQuestionRequest
{
    public string CandidateId { get; set; } // Change from CandidateName to CandidateId
    public int SelectedChoice { get; set; }
}