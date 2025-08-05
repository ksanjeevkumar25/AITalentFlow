using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LoginApp.Data;
using LoginApp.Models;

namespace LoginApp.Controllers
{
    public class AccountController : Controller
    {
        private readonly SqlDataAccess _dataAccess;

        public AccountController()
        {
            _dataAccess = new SqlDataAccess();
        }
        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            // If user is already authenticated, redirect to home
            //if (User.Identity?.IsAuthenticated == true)
            //{
            //    return RedirectToAction("Index", "Home");
            //}

            ViewData["ReturnUrl"] = returnUrl;
            ViewData["IsFirstVisit"] = !Request.Cookies.ContainsKey("hasVisited");
            
            // Set a cookie to track if user has visited before
            if (!Request.Cookies.ContainsKey("hasVisited"))
            {
                Response.Cookies.Append("hasVisited", "true", new CookieOptions
                {
                    Expires = DateTime.Now.AddYears(1),
                    HttpOnly = true
                });
            }

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string username, string password, string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;

            // Validate credentials against database
            var employee = _dataAccess.ValidateUserLogin(username, password);
            
            if (employee != null)
            {
                // Check if user is admin
                bool isAdmin = _dataAccess.IsUserAdmin(employee.EmployeeID);
                
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, employee.EmailID),
                    new Claim(ClaimTypes.NameIdentifier, employee.EmployeeID.ToString()),
                    new Claim("EmployeeID", employee.EmployeeID.ToString()),
                    new Claim("FullName", $"{employee.FirstName} {employee.LastName}".Trim()),
                    new Claim(ClaimTypes.Role, isAdmin ? "Admin" : "User")
                };

                // Add department claim if available
                if (!string.IsNullOrEmpty(employee.Department))
                {
                    claims.Add(new Claim("Department", employee.Department));
                }

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8) // Extended session time
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                // Redirect based on role
                if (isAdmin)
                {
                    return RedirectToAction("AdminView", "Home");
                }
                else
                {
                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
            }

            ModelState.AddModelError(string.Empty, "Invalid email or password.");
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login", "Account");
        }

        public IActionResult AccessDenied()
        {
            return View();
        }

        private bool IsValidUser(string emailId, string password)
        {
            // Database validation instead of hardcoded credentials
            var employee = _dataAccess.ValidateUserLogin(emailId, password);
            return employee != null;
        }
    }
}