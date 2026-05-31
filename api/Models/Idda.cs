namespace NerimanovOps.Api.Models;

/// <summary>İDDA Gateway sənədi — RİH-in göndərdiyi (gedən) sənəd.
/// İki növ: (a) başqa quruma göndərilən, (b) müraciətə cavab olaraq əlaqəli şəxsə (vətəndaşa) göndərilən.</summary>
public class IddaDocument
{
    public string Id { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Content { get; set; } = "";
    public string RecipientOrg { get; set; } = "";       // alıcının adı (qurum və ya şəxs)
    public string RecipientType { get; set; } = "org";   // org = qurum | person = əlaqəli şəxs (vətəndaş)
    public string Sender { get; set; } = "";
    public string SignatureType { get; set; } = "SIMA"; // SIMA | ASAN
    // SENT | RECEIVED | IN_GENERAL_DEPT | ASSIGNED | IN_PROGRESS | RESOLVED | ARCHIVED
    public string Status { get; set; } = "SENT";
    public string CreatedAt { get; set; } = "";
    public string? IncidentId { get; set; }
    public List<IddaStep> Timeline { get; set; } = new();
}

/// <summary>İDDA status izləmə addımı (immutable audit).</summary>
public class IddaStep
{
    public string Status { get; set; } = "";
    public string T { get; set; } = "";
    public string Actor { get; set; } = "";
    public string Note { get; set; } = "";
}

/// <summary>Yeni İDDA sənədi (3-step wizard nəticəsi).</summary>
public class CreateIddaRequest
{
    public string Subject { get; set; } = "";
    public string Content { get; set; } = "";
    public string RecipientOrg { get; set; } = "";
    public string RecipientType { get; set; } = "org"; // org = qurum | person = əlaqəli şəxs
    public string SignatureType { get; set; } = "SIMA";
    public string? IncidentId { get; set; }
}

/// <summary>Qəbul edən təşkilat (İDDA alıcı ağacı).</summary>
public class Organization
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Parent { get; set; } = "";
    public string Type { get; set; } = "dovlet"; // dovlet | ozel
}
