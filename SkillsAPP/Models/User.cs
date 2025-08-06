namespace LoginApp.Models
{
    public class User
    {
        public int UserID { get; set; }
        public int EmployeeID { get; set; }
        public string Password { get; set; } = string.Empty;
    }
}
