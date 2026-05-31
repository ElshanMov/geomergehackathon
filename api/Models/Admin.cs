namespace NerimanovOps.Api.Models;

/// <summary>Admin → LDAP istifadəçiləri (CRUD). Kataloq hesabı.</summary>
public class LdapUser
{
    public string Id { get; set; } = "";
    public string Dn { get; set; } = "";    // cn=...,ou=...,dc=...
    public string Cn { get; set; } = "";    // common name
    public string Uid { get; set; } = "";
    public string Email { get; set; } = "";
    public string Ou { get; set; } = "";    // org unit / şöbə
    public List<string> Groups { get; set; } = new();
    public bool Enabled { get; set; } = true;
    public string LastSync { get; set; } = "";
}

/// <summary>Admin → İmtiyazlar üçün rol.</summary>
public class Role
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int UserCount { get; set; }
}

/// <summary>Rol × resurs icazə sətri (privilege matrisi).</summary>
public class RolePermission
{
    public string RoleId { get; set; } = "";
    public string Resource { get; set; } = "";   // incidents, routes, users ...
    public string ResourceLabel { get; set; } = "";
    public bool View { get; set; }
    public bool Create { get; set; }
    public bool Edit { get; set; }
    public bool Delete { get; set; }
}

/// <summary>Admin → Şifrə sazlanmaları (parol siyasəti). Tək konfiq.</summary>
public class PasswordPolicy
{
    public int MinLength { get; set; } = 8;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireSpecial { get; set; } = false;
    public int ExpiryDays { get; set; } = 90;
    public int HistoryCount { get; set; } = 5;
    public int MaxFailedAttempts { get; set; } = 5;
    public int LockoutMinutes { get; set; } = 15;
    public int SessionTimeoutMinutes { get; set; } = 30;
    public bool TwoFactorRequired { get; set; } = false;
}
