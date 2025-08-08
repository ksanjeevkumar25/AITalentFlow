using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LoginApp.Data;
using LoginApp.Models;
using LoginApp.Helpers;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text.Json;

namespace LoginApp.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly SqlDataAccess _dataAccess = new SqlDataAccess();

        [HttpGet]
        public IActionResult Index()
        {
            // Get all skills from the database
            var skills = _dataAccess.GetSkills();
            return View(skills);
        }

        [HttpGet]
        public IActionResult SkillView()
        {
            // Get all skills from the Skill table (singular)
            var skills = _dataAccess.GetSkills();
            // Get EmployeeID from session if available
            int employeeId = HttpContext.Session.GetInt32("EmployeeID") ?? AppConstants.EmployeeID;
            var existingEmployeeSkills = _dataAccess.GetEmployeeSkills(employeeId);
            var viewModel = new SkillViewViewModel
            {
                Skills = skills,
                ExistingEmployeeSkills = existingEmployeeSkills
            };
            return View(viewModel);
        }

        [HttpPost]
        public IActionResult RateSkill(int skillId, int skillLevel, int yearsOfExperience, DateTime lastWorkedDate)
        {
            try
            {
                // Check if employee skill already exists
                var existingEmployeeSkills = _dataAccess.GetEmployeeSkills(AppConstants.EmployeeID);
                var existingEmployeeSkill = existingEmployeeSkills.FirstOrDefault(es => es.SkillID == skillId);
                if (existingEmployeeSkill != null)
                {
                    // Update existing record
                    existingEmployeeSkill.EmployeeRatedSkillLevel = skillLevel;
                    existingEmployeeSkill.YearsOfExperience = yearsOfExperience;
                    existingEmployeeSkill.EmployeeLastWorkedOnThisSkill = lastWorkedDate;
                    existingEmployeeSkill.EmployeeSkillModifiedDate = DateTime.Today;
                    _dataAccess.UpdateEmployeeSkill(existingEmployeeSkill);
                }
                else
                {
                    //first do select on EmployeeSkills table and get the maximum EmployeeSkillID
                    //var maxId = _dataAccess.GetMaxEmployeeSkillID();

                    // Create new record
                    var employeeSkill = new EmployeeSkills
                    {
                       // EmployeeSkillID = maxId + 1, // Assuming auto-increment in the database
                        EmployeeID = AppConstants.EmployeeID,
                        SkillID = skillId,
                        EmployeeRatedSkillLevel = skillLevel,
                        YearsOfExperience = yearsOfExperience,
                        EmployeeLastWorkedOnThisSkill = lastWorkedDate,
                        EmployeeSkillModifiedDate = DateTime.Today,
                        SupervisorRatedSkillLevel = null,
                        SupervisorRatingUpdatedOn = null,
                        AIEvaluatedScore = null,
                        AIEvaluationDate = null,
                        AIEvaluationRemarks = null
                    };
                    _dataAccess.InsertEmployeeSkill(employeeSkill);
                }
                return Json(new { success = true, message = "Skill rating saved successfully!" });
            }
            catch (Exception ex)
            {
                throw new Exception("Error saving skill rating: " + ex.Message, ex);
                return Json(new { success = false, message = "Error saving skill rating: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UploadResume(IFormFile resume)
        {
            if (resume == null || resume.Length == 0)
            {
                ModelState.AddModelError("Resume", "Please select a file.");
                return RedirectToAction("Index");
            }
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(resume.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                ModelState.AddModelError("Resume", "Only PDF and DOC/DOCX files are allowed.");
                return RedirectToAction("Index");
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
                resumeText = ResumeTextExtractor.ExtractText(filePath);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("Resume", $"Failed to extract text: {ex.Message}");
                return RedirectToAction("Index");
            }

            // Get all skills from DB and match
            var skills = _dataAccess.GetSkills();
            var foundSkills = skills
                .Where(skill => !string.IsNullOrWhiteSpace(skill.SkillName) && resumeText.IndexOf(skill.SkillName, StringComparison.OrdinalIgnoreCase) >= 0)
                .Select(skill => skill.SkillName)
                .ToList();

            // Save found skills to JSON file
            var skillsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "skills");
            if (!Directory.Exists(skillsDir))
                Directory.CreateDirectory(skillsDir);
            var skillsJsonPath = Path.Combine(skillsDir, User.Identity?.Name + "_skills.json");
            await System.IO.File.WriteAllTextAsync(skillsJsonPath, JsonSerializer.Serialize(foundSkills));

            ViewBag.Message = "Resume uploaded and skills extracted successfully!";
            return RedirectToAction("Index");
        }
    }

    public class SkillViewViewModel
    {
        public List<Skill> Skills { get; set; } = new();
        public List<EmployeeSkills> ExistingEmployeeSkills { get; set; } = new();
    }
}