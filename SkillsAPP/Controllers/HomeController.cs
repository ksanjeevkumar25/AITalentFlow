using LoginApp.Data;
using LoginApp.Models;
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace LoginApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly SqlDataAccess _dataAccess;
        private readonly IConfiguration _configuration;

        public HomeController(SqlDataAccess dataAccess, IConfiguration configuration)
        {
            _dataAccess = dataAccess;
            _configuration = configuration;
        }

        [Authorize]
        public IActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Admin")]
        public IActionResult AdminView()
        {
            // Get SupervisorID from session if available
            int supervisorId = HttpContext.Session.GetInt32("SupervisorID") ?? 0;
            var pendingSkills = _dataAccess.GetAllReportingEmployeeSkills(supervisorId)
               .FindAll(s => s.SupervisorRatedSkillLevel == null);
            var allSkills = _dataAccess.GetSkills();
            ViewBag.AllSkills = allSkills;
            var vm = new AdminSkillRatingsViewModel { Ratings = pendingSkills };
            return View(vm);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateAllSupervisorRatings(AdminSkillRatingsViewModel model)
        {
            foreach (var rating in model.Ratings)
            {
                if (rating.SupervisorRatedSkillLevel.HasValue)
                {
                    _dataAccess.UpdateSupervisorRating(
                        rating.EmployeeID,
                        rating.SkillID,
                        rating.SupervisorRatedSkillLevel.Value,
                        DateTime.Now
                    );
                }
            }
            TempData["UpdateMessage"] = "All ratings updated successfully.";
            return RedirectToAction("AdminView");
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UploadResume(IFormFile resume)
        {
            if (resume == null || resume.Length == 0)
            {
                ViewBag.ResumeMessage = "Please select a file.";
                return View("Index");
            }
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(resume.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                ViewBag.ResumeMessage = "Only PDF and DOC/DOCX files are allowed.";
                return View("Index");
            }
            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resumes");
            if (!Directory.Exists(uploads))
                Directory.CreateDirectory(uploads);
            var filePath = Path.Combine(uploads, User.Identity?.Name + extension);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await resume.CopyToAsync(stream);
            }

            // Extract text from resume
            string resumeText = string.Empty;
            try
            {
                resumeText = LoginApp.Helpers.ResumeTextExtractor.ExtractText(filePath);
            }
            catch (Exception ex)
            {
                ViewBag.ResumeMessage = $"Failed to extract text: {ex.Message}";
                return View("Index");
            }

            // Call external API to extract skills from resume text
            using var httpClient = new HttpClient();
            var apiUrl = "https://skillapp-bjegbscuead7aea4.ukwest-01.azurewebsites.net/api/Interview/extract-skills-from-text";

            // Send the resume text as a raw JSON string (not as an object)
            var content = new StringContent(JsonConvert.SerializeObject(resumeText), Encoding.UTF8, "application/json");

            // Make the API call
            var response = await httpClient.PostAsync(apiUrl, content);
            response.EnsureSuccessStatusCode();

            // Parse the response (assuming it returns a JSON array of skills)
            var responseString = await response.Content.ReadAsStringAsync();
            var foundSkills = JsonConvert.DeserializeObject<List<string>>(responseString);

            // Read master skills from configuration
            var allPossibleSkills = _configuration.GetSection("MasterSkills").Get<List<string>>() ?? new List<string>();

            // Get all skills from DB (normalize to lower for comparison)
            var dbSkills = _dataAccess.GetSkills()
                .Select(s => s.SkillName.Trim().ToLowerInvariant())
                .ToHashSet();

            // Find skills in resume that are in master list but NOT in DB
            //foundSkills = foundSkills
            //    .Where(skill =>
            //        allPossibleSkills.Contains(skill, StringComparer.OrdinalIgnoreCase)
            //        && !dbSkills.Contains(skill.ToLowerInvariant())
            //        )
            //    .ToList();

            // Insert new skills into Skill table and collect their SkillIDs
            var insertedSkillIds = new List<int>();
            foreach (var skillName in foundSkills)
            {
                // Check if the skill already exists (case-insensitive)
                var existingSkill = _dataAccess.GetSkills()
                    .FirstOrDefault(s => s.SkillName.Equals(skillName, StringComparison.OrdinalIgnoreCase));

                if (existingSkill != null)
                {
                    // Skill exists, add its SkillID
                    insertedSkillIds.Add(existingSkill.SkillID);
                }
                else
                {
                    // Insert the new skill
                    var newSkill = new Skill
                    {
                        SkillName = skillName,
                        SkillDescription = skillName
                    };
                    _dataAccess.InsertSkill(newSkill);

                    // Retrieve the SkillID of the inserted skill
                    var insertedSkill = _dataAccess.GetSkills()
                        .FirstOrDefault(s => s.SkillName.Equals(skillName, StringComparison.OrdinalIgnoreCase));
                    if (insertedSkill != null)
                    {
                        insertedSkillIds.Add(insertedSkill.SkillID);
                    }
                }
            }
            // insertedSkillIds now contains the SkillIDs of all found skills, whether newly inserted or already existing

            // Get EmployeeID for the logged-in user
            var employee = _dataAccess.GetEmployeeByEmailId(User.Identity.Name);

            if (employee != null)
            {
                int nextEmployeeSkillId = _dataAccess.GetMaxEmployeeSkillID() + 1;
                 foreach (var skillId in insertedSkillIds)
                {
                    // Check if the EmployeeSkills record already exists to avoid duplicates
                    var existingEmpSkill = _dataAccess.GetEmployeeSkills(employee.EmployeeID)
                        .FirstOrDefault(es => es.SkillID == skillId);

                    if (existingEmpSkill == null)
                    {
                        var newEmployeeSkill = new EmployeeSkills
                        {
                            EmployeeSkillID = nextEmployeeSkillId++,
                            EmployeeID = employee.EmployeeID,
                            SkillID = skillId,
                            EmployeeRatedSkillLevel = null,
                            EmployeeSkillModifiedDate = null,
                            YearsOfExperience = null,
                            SupervisorRatedSkillLevel = null,
                            SupervisorRatingUpdatedOn = null,
                            AIEvaluatedScore = null,
                            AIEvaluationDate = null,
                            AIEvaluationRemarks = null,
                            EmployeeLastWorkedOnThisSkill = null
                        };
                        _dataAccess.InsertEmployeeSkill(newEmployeeSkill);
                    }
                }
            }

            //// Save new skills to JSON file
            //var skillsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "skills");
            //if (!Directory.Exists(skillsDir))
            //    Directory.CreateDirectory(skillsDir);
            //var skillsJsonPath = Path.Combine(skillsDir, User.Identity?.Name + "_newskills.json");
            //await System.IO.File.WriteAllTextAsync(skillsJsonPath, System.Text.Json.JsonSerializer.Serialize(foundSkills));

            ViewBag.ResumeMessage = "Resume uploaded and new skills extracted successfully!";
            return View("Index");
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}