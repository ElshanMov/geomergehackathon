using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Admin → İstifadəçilər (CRUD). Sistemə giriş hesabları.</summary>
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly MockDataStore _db;
    public UsersController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<SystemUser> List([FromQuery] string? role, [FromQuery] string? status)
    {
        IEnumerable<SystemUser> items = _db.Users;
        if (!string.IsNullOrWhiteSpace(role)) items = items.Where(u => u.Role == role);
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(u => u.Status == status);
        return items.ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<SystemUser> Get(string id)
    {
        var u = _db.Users.FirstOrDefault(x => x.Id == id);
        return u is null ? NotFound() : u;
    }

    [HttpPost]
    public ActionResult<SystemUser> Create(SystemUser u)
    {
        if (string.IsNullOrWhiteSpace(u.Id)) u.Id = _db.NextId("U");
        if (string.IsNullOrWhiteSpace(u.Init)) u.Init = Initials(u.FullName);
        if (string.IsNullOrWhiteSpace(u.CreatedAt)) u.CreatedAt = MockDataStore.NowStamp();
        _db.Users.Add(u);
        _db.SyncRepActor(u); // RİH nümayəndəsidirsə cockpit-də icraçı kimi görünsün
        return CreatedAtAction(nameof(Get), new { id = u.Id }, u);
    }

    [HttpPut("{id}")]
    public ActionResult<SystemUser> Update(string id, SystemUser u)
    {
        var existing = _db.Users.FirstOrDefault(x => x.Id == id);
        if (existing is null) return NotFound();
        existing.FullName = u.FullName;
        existing.Username = u.Username;
        existing.Email = u.Email;
        existing.Phone = u.Phone;
        existing.Role = u.Role;
        existing.Department = u.Department;
        existing.Status = u.Status;
        existing.TwoFactor = u.TwoFactor;
        existing.Init = string.IsNullOrWhiteSpace(u.Init) ? Initials(u.FullName) : u.Init;
        _db.SyncRepActor(existing); // ad/rol dəyişikliyini cockpit Actor-una yansıt
        return existing;
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var u = _db.Users.FirstOrDefault(x => x.Id == id);
        if (u is null) return NotFound();
        _db.Users.Remove(u);
        _db.RemoveActorForUser(id);
        return NoContent();
    }

    private static string Initials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length == 0 ? "?" : string.Concat(parts.Take(2).Select(p => char.ToUpper(p[0])));
    }
}
