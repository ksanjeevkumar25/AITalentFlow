namespace LoginApp.Models
{
    public class Employee
    {
        public int EmployeeID { get; set; }
        public string EmailID { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int? SupervisorID { get; set; }
        // Add other employee properties as needed
    }
}
