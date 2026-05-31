using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Mock auth — mobile + web/admin login. SQL/token yoxdur, demo üçün.</summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly MockDataStore _db;
    public AuthController(MockDataStore db) => _db = db;

    /// <summary>Login: username ilə uyğun istifadəçi qaytarılır (parol mock — yoxlanmır).</summary>
    [HttpPost("login")]
    public ActionResult<AuthResponse> Login(LoginRequest req)
    {
        // Vətəndaş (mobile Citizen) — demo hesab
        if (req.Role == "citizen")
        {
            return new AuthResponse
            {
                Token = "mock-citizen-token",
                Role = "citizen",
                UserId = "cit1",
                FullName = "Anar Səfərov",
                Init = "AS"
            };
        }

        // Demo işçi ID-ləri (mobil login ekranı bunları doldurur) → sistem istifadəçisi.
        var badge = req.Username.Trim();
        var byBadge = badge switch
        {
            "4471" => "rep1",
            "4472" => "rep2",
            "4473" => "rep3",
            _ => (string?)null
        };

        var user = byBadge is not null
            ? _db.Users.FirstOrDefault(u => u.Id == byBadge)
            : _db.Users.FirstOrDefault(u =>
                u.Username.Equals(req.Username, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Equals(req.Username, StringComparison.OrdinalIgnoreCase));

        if (user is null) return Unauthorized(new { message = "İstifadəçi tapılmadı." });
        if (user.Status == "blocked") return StatusCode(403, new { message = "Hesab bloklanıb." });

        return new AuthResponse
        {
            Token = $"mock-{user.Id}-token",
            Role = user.Role,
            UserId = user.Id,
            FullName = user.FullName,
            Init = user.Init,
            Department = user.Department,
            Email = user.Email
        };
    }

    /// <summary>Cari istifadəçi (token-dən id çıxarılır — mock).</summary>
    [HttpGet("me/{userId}")]
    public ActionResult<SystemUser> Me(string userId)
    {
        var u = _db.Users.FirstOrDefault(x => x.Id == userId);
        return u is null ? NotFound() : u;
    }
}

public class LoginRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = ""; // citizen → mobile vətəndaş; boş → sistem istifadəçisi
}

public class AuthResponse
{
    public string Token { get; set; } = "";
    public string Role { get; set; } = "";
    public string UserId { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Init { get; set; } = "";
    public string? Department { get; set; }
    public string? Email { get; set; }
}
