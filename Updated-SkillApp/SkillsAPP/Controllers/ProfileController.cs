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
        private readonly SqlDataAccess _dataAccess;

        public ProfileController(SqlDataAccess dataAccess)
        {
            _dataAccess = dataAccess;
        }

        // Helper to get or create the in-memory list for the session
        private List<EmployeeSkills> GetSessionEmployeeSkills(int employeeId)
        {
            var key = $"EmployeeSkills_{employeeId}";
            var json = HttpContext.Session.GetString(key);
            if (!string.IsNullOrEmpty(json))
                return JsonSerializer.Deserialize<List<EmployeeSkills>>(json) ?? new List<EmployeeSkills>();
            return new List<EmployeeSkills>();
        }

        private void SetSessionEmployeeSkills(int employeeId, List<EmployeeSkills> skills)
        {
            var key = $"EmployeeSkills_{employeeId}";
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(skills));
        }

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
            // Try to get from session first, else from DB
            var existingEmployeeSkills = GetSessionEmployeeSkills(employeeId);
            if (existingEmployeeSkills == null || !existingEmployeeSkills.Any())
            {
                existingEmployeeSkills = _dataAccess.GetEmployeeSkills(employeeId);
                SetSessionEmployeeSkills(employeeId, existingEmployeeSkills);
            }
            var viewModel = new SkillViewViewModel
            {
                Skills = skills,
                ExistingEmployeeSkills = existingEmployeeSkills
            };
            return View(viewModel);
        }

        [HttpPost]
        public IActionResult AddSkillToEmployee(int skillId)
        {
            int employeeId = HttpContext.Session.GetInt32("EmployeeID") ?? AppConstants.EmployeeID;
            var skills = _dataAccess.GetSkills();
            var skill = skills.FirstOrDefault(s => s.SkillID == skillId);
            if (skill == null)
                return Json(new { success = false, message = "Skill not found." });

            var employeeSkills = GetSessionEmployeeSkills(employeeId);
            if (employeeSkills.Any(es => es.SkillID == skillId))
                return Json(new { success = false, message = "Skill already added." });

            var newEmpSkill = new EmployeeSkills
            {
                EmployeeID = employeeId,
                SkillID = skillId,
                EmployeeRatedSkillLevel = null,
                YearsOfExperience = null,
                EmployeeLastWorkedOnThisSkill = null,
                EmployeeSkillModifiedDate = null,
                SupervisorRatedSkillLevel = null,
                SupervisorRatingUpdatedOn = null,
                AIEvaluatedScore = null,
                AIEvaluationDate = null,
                AIEvaluationRemarks = null
            };
            employeeSkills.Add(newEmpSkill);
            SetSessionEmployeeSkills(employeeId, employeeSkills);

            // Insert into database as well
            _dataAccess.InsertEmployeeSkill(newEmpSkill);

            return Json(new { success = true, message = "Skill added.", skill = skill });
        }

        [HttpPost]
        public IActionResult RateSkill(int skillId, int skillLevel, int yearsOfExperience, DateTime lastWorkedDate)
        {
            try
            {
                int employeeId = HttpContext.Session.GetInt32("EmployeeID") ?? AppConstants.EmployeeID;
                // Use session list if available
                var employeeSkills = GetSessionEmployeeSkills(employeeId);
                var existingEmployeeSkill = employeeSkills.FirstOrDefault(es => es.SkillID == skillId);

                if (existingEmployeeSkill != null)
                {

                    // Update in-memory
                    existingEmployeeSkill.EmployeeRatedSkillLevel = skillLevel;
                    existingEmployeeSkill.YearsOfExperience = yearsOfExperience;
                    existingEmployeeSkill.EmployeeLastWorkedOnThisSkill = lastWorkedDate;
                    existingEmployeeSkill.EmployeeSkillModifiedDate = DateTime.Today;
                    // Save to DB
                    var dbSkills = _dataAccess.GetEmployeeSkills(employeeId);
                    var dbSkill = dbSkills.FirstOrDefault(es => es.SkillID == skillId);
                    if (dbSkill != null)
                    {
                        dbSkill.EmployeeRatedSkillLevel = skillLevel;
                        dbSkill.YearsOfExperience = yearsOfExperience;
                        dbSkill.EmployeeLastWorkedOnThisSkill = lastWorkedDate;
                        dbSkill.EmployeeSkillModifiedDate = DateTime.Today;
                        _dataAccess.UpdateEmployeeSkill(dbSkill);
                    }
                    else
                    
                    {              
                         existingEmployeeSkill.SkillID = skillId;
                        existingEmployeeSkill.EmployeeID = employeeId;
                        

                        _dataAccess.InsertEmployeeSkill(existingEmployeeSkill);
                    }
                }
                else
                {
                    var employeeSkill = new EmployeeSkills
                    {
                        EmployeeSkillID = 1000,

                        EmployeeID = employeeId,
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
                     employeeSkills.Add(employeeSkill);
                    _dataAccess.InsertEmployeeSkill(employeeSkill);
                }
                SetSessionEmployeeSkills(employeeId, employeeSkills);
                return Json(new { success = true, message = "Skill rating saved successfully!" });
            }
            catch (Exception ex)
            {
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