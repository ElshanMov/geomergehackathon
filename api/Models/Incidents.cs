namespace NerimanovOps.Api.Models;

/// <summary>Vətəndaş və ya AI mənbəli müraciət/incident.</summary>
public class Incident
{
    public string Id { get; set; } = "";          // NRM-24817
    public string Reg { get; set; } = "";          // 4019-2026-N (qeydiyyat nömrəsi)
    public string Title { get; set; } = "";
    public string Cat { get; set; } = "";          // Kommunal / Su təchizatı
    public string Priority { get; set; } = "normal"; // urgent | high | normal | low
    public string Status { get; set; } = "new";      // lifecycle id
    public string Layer { get; set; } = "L1";        // L1..L15
    public double Lng { get; set; }
    public double Lat { get; set; }
    public string Addr { get; set; } = "";
    public string Created { get; set; } = "";
    public string Due { get; set; } = "";
    public string Reporter { get; set; } = "";
    public string? Assignee { get; set; }            // actor id (rep1...) və ya null
    public string Sla { get; set; } = "ok";          // ok | risk
    public string Desc { get; set; } = "";
    public int Photos { get; set; }
    public List<string> PhotoUrls { get; set; } = new(); // base64 data-URI şəkillər (mobil müraciət)
    public int? AiConfidence { get; set; }
    public string? CancelReason { get; set; }
    public List<TimelineStep> Timeline { get; set; } = new();
}

/// <summary>Müraciətin həyat dövrü addımı (status log).</summary>
public class TimelineStep
{
    public string Step { get; set; } = "";   // lifecycle id
    public string Actor { get; set; } = "";  // actor id
    public string T { get; set; } = "";      // 30 May 08:12
    public string Note { get; set; } = "";
}

/// <summary>Yeni müraciət yaratmaq üçün gələn DTO (mobile + web FAB).</summary>
public class CreateIncidentRequest
{
    public string Title { get; set; } = "";
    public string Desc { get; set; } = "";
    public string? Cat { get; set; }
    public string? Priority { get; set; }
    public string? Addr { get; set; }
    public double? Lng { get; set; }
    public double? Lat { get; set; }
    public string? Reporter { get; set; }
    public string? Assignee { get; set; }
    public int Photos { get; set; }
    public List<string>? PhotoUrls { get; set; } // base64 data-URI şəkillər (istəyə bağlı)
}

/// <summary>Operator qərarı: müraciəti təsdiq (uyğundur) və ya ləğv et.</summary>
public class IncidentDecisionRequest
{
    public string Decision { get; set; } = ""; // accept | reject
    public string? Cat { get; set; }
    public string? Priority { get; set; }
    public string? Assignee { get; set; }
    public string? Due { get; set; }
    public string Note { get; set; } = "";     // məcburi (səbəb / qeyd)
}
