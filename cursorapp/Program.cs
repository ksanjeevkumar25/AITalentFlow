using Microsoft.AspNetCore.Authentication.Cookies;
using LoginApp.Data;
using System.Diagnostics;

var stopwatch = Stopwatch.StartNew();
Console.WriteLine($"[Startup] Application starting at {DateTime.Now:O}");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();


// Add authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied";
    });

Console.WriteLine($"[Startup] Services configured at {DateTime.Now:O} (Elapsed: {stopwatch.ElapsedMilliseconds} ms)");
var app = builder.Build();
Console.WriteLine($"[Startup] App built at {DateTime.Now:O} (Elapsed: {stopwatch.ElapsedMilliseconds} ms)");

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// Set default route to redirect to login
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");

Console.WriteLine($"[Startup] Before app.Run() at {DateTime.Now:O} (Elapsed: {stopwatch.ElapsedMilliseconds} ms)");
app.Run();
// This line will not be reached, but if you ever use app.RunAsync(), you can log after.