using LoginApp.Data;
using LoginApp.Models;
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;

namespace LoginApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly SqlDataAccess _dataAccess = new SqlDataAccess();

        [Authorize]
        public IActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Admin")]
        public IActionResult AdminView()
        {
            //101 is supriser 
            var pendingSkills = _dataAccess.GetAllReportingEmployeeSkills(AppConstants.SupervisorID)
               .FindAll(s => s.SupervisorRatedSkillLevel == null);

            //var pendingSkills = _dataAccess.GetEmployeeSkills(101)
            //    .FindAll(s => s.SupervisorRatedSkillLevel == null);
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
        public IActionResult UploadResume(IFormFile resume)
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
                resume.CopyTo(stream);
            }
            ViewBag.ResumeMessage = "Resume uploaded successfully!";
            return View("Index");
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}