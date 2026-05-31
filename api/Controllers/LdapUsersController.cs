using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Admin → LDAP istifadəçiləri (CRUD). Kataloq hesabları.</summary>
[ApiController]
[Route("api/ldap-users")]
public class LdapUsersController : ControllerBase
{
    private readonly MockDataStore _db;
    public LdapUsersController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<LdapUser> List() => _db.LdapUsers;

    [HttpGet("{id}")]
    public ActionResult<LdapUser> Get(string id)
    {
        var u = _db.LdapUsers.FirstOrDefault(x => x.Id == id);
        return u is null ? NotFound() : u;
    }

    [HttpPost]
    public ActionResult<LdapUser> Create(LdapUser u)
    {
        if (string.IsNullOrWhiteSpace(u.Id)) u.Id = _db.NextId("LDAP");
        if (string.IsNullOrWhiteSpace(u.LastSync)) u.LastSync = MockDataStore.NowStamp();
        _db.LdapUsers.Add(u);
        return CreatedAtAction(nameof(Get), new { id = u.Id }, u);
    }

    [HttpPut("{id}")]
    public ActionResult<LdapUser> Update(string id, LdapUser u)
    {
        var existing = _db.LdapUsers.FirstOrDefault(x => x.Id == id);
        if (existing is null) return NotFound();
        existing.Dn = u.Dn;
        existing.Cn = u.Cn;
        existing.Uid = u.Uid;
        existing.Email = u.Email;
        existing.Ou = u.Ou;
        existing.Groups = u.Groups;
        existing.Enabled = u.Enabled;
        return existing;
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var u = _db.LdapUsers.FirstOrDefault(x => x.Id == id);
        if (u is null) return NotFound();
        _db.LdapUsers.Remove(u);
        return NoContent();
    }

    /// <summary>Kataloqdan sinxronizasiya (mock — LastSync yenilənir).</summary>
    [HttpPost("sync")]
    public IEnumerable<LdapUser> Sync()
    {
        var now = MockDataStore.NowStamp();
        foreach (var u in _db.LdapUsers) u.LastSync = now;
        return _db.LdapUsers;
    }
}
