using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Admin → İmtiyazlar: rollar + rol×resurs icazə matrisi.</summary>
[ApiController]
[Route("api/privileges")]
public class PrivilegesController : ControllerBase
{
    private readonly MockDataStore _db;
    public PrivilegesController(MockDataStore db) => _db = db;

    [HttpGet("roles")]
    public IEnumerable<Role> Roles() => _db.Roles;

    [HttpGet("permissions")]
    public IEnumerable<RolePermission> Permissions([FromQuery] string? roleId) =>
        string.IsNullOrWhiteSpace(roleId) ? _db.Permissions : _db.Permissions.Where(p => p.RoleId == roleId);

    /// <summary>İcazə sətrini yenilə (matris checkbox dəyişikliyi).</summary>
    [HttpPut("permissions")]
    public ActionResult<RolePermission> UpdatePermission(RolePermission perm)
    {
        var existing = _db.Permissions.FirstOrDefault(p => p.RoleId == perm.RoleId && p.Resource == perm.Resource);
        if (existing is null) return NotFound();
        existing.View = perm.View;
        existing.Create = perm.Create;
        existing.Edit = perm.Edit;
        existing.Delete = perm.Delete;
        return existing;
    }
}

/// <summary>Admin → Şifrə sazlanmaları (parol siyasəti). Tək konfiq.</summary>
[ApiController]
[Route("api/password-policy")]
public class PasswordPolicyController : ControllerBase
{
    private readonly MockDataStore _db;
    public PasswordPolicyController(MockDataStore db) => _db = db;

    [HttpGet]
    public PasswordPolicy Get() => _db.PasswordPolicy;

    [HttpPut]
    public PasswordPolicy Update(PasswordPolicy policy)
    {
        _db.PasswordPolicy = policy;
        return policy;
    }
}
