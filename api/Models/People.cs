namespace NerimanovOps.Api.Models;

/// <summary>Timeline/feed-də göstərilən yüngül aktor (operator, nümayəndə, AI, sistem).</summary>
public class Actor
{
    public string Id { get; set; } = "";    // op1, rep1, ai, sys
    public string Name { get; set; } = "";
    public string Role { get; set; } = "";
    public string Init { get; set; } = "";   // LM, RQ ...
    public string Color { get; set; } = "#64748B";
}

/// <summary>Admin → İstifadəçilər (CRUD). Sistemə giriş hesabı.</summary>
public class SystemUser
{
    public string Id { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Role { get; set; } = "operator"; // operator | representative | admin
    public string Department { get; set; } = "";
    public string Status { get; set; } = "active";  // active | blocked
    public string Init { get; set; } = "";
    public string Color { get; set; } = "#0EA5E9";
    public bool TwoFactor { get; set; }
    public string CreatedAt { get; set; } = "";
    public string LastLogin { get; set; } = "";
}

/// <summary>Admin → İşçilərin siyahısı (CRUD). RİH əməkdaşı / sahə nümayəndəsi.</summary>
public class Worker
{
    public string Id { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Position { get; set; } = "";    // Vəzifə
    public string Department { get; set; } = "";  // Şöbə
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string Zone { get; set; } = "";        // Cavabdeh ərazi
    public string Status { get; set; } = "active"; // active | leave | inactive
    public string Init { get; set; } = "";
    public string Color { get; set; } = "#10B981";
    public int OpenTasks { get; set; }
}
