using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

[ApiController]
[Route("api/incidents")]
public class IncidentsController : ControllerBase
{
    private readonly MockDataStore _db;
    public IncidentsController(MockDataStore db) => _db = db;

    /// <summary>Müraciət siyahısı. Filtrlər: status, assignee, layer, priority, reporter, q (axtarış).</summary>
    [HttpGet]
    public IEnumerable<Incident> List(
        [FromQuery] string? status, [FromQuery] string? assignee, [FromQuery] string? layer,
        [FromQuery] string? priority, [FromQuery] string? reporter, [FromQuery] string? q)
    {
        IEnumerable<Incident> items = _db.Incidents;
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(i => i.Status == status);
        if (!string.IsNullOrWhiteSpace(assignee)) items = items.Where(i => i.Assignee == assignee);
        if (!string.IsNullOrWhiteSpace(layer)) items = items.Where(i => i.Layer == layer);
        if (!string.IsNullOrWhiteSpace(priority)) items = items.Where(i => i.Priority == priority);
        if (!string.IsNullOrWhiteSpace(reporter)) items = items.Where(i => i.Reporter.Contains(reporter, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(q))
            items = items.Where(i =>
                i.Title.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                i.Id.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                i.Addr.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                i.Cat.Contains(q, StringComparison.OrdinalIgnoreCase));
        return items.ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<Incident> Get(string id)
    {
        var inc = _db.Incidents.FirstOrDefault(i => i.Id == id);
        return inc is null ? NotFound() : inc;
    }

    /// <summary>Yeni müraciət (mobile vətəndaş / web FAB). Status = new.</summary>
    [HttpPost]
    public ActionResult<Incident> Create(CreateIncidentRequest req)
    {
        var inc = new Incident
        {
            Id = _db.NextId("NRM"),
            Reg = _db.NextId("N").Replace("N-", "") + "-2026-N",
            Title = req.Title,
            Desc = req.Desc,
            Cat = req.Cat ?? "Təsnif gözləyir",
            Priority = req.Priority ?? "normal",
            Status = "new",
            Layer = "L1",
            Lng = req.Lng ?? 49.8516,
            Lat = req.Lat ?? 40.4093,
            Addr = req.Addr ?? "Nərimanov rayonu",
            Created = MockDataStore.NowStamp(),
            Due = "—",
            Reporter = req.Reporter ?? "Vətəndaş",
            Assignee = req.Assignee,
            Sla = "ok",
            Photos = req.PhotoUrls is { Count: > 0 } ? req.PhotoUrls.Count : req.Photos,
            PhotoUrls = req.PhotoUrls ?? new(),
            Timeline = new() { new() { Step = "new", Actor = "op1", T = MockDataStore.NowT(), Note = "Müraciət qəbul edildi, təsnifat gözləyir." } }
        };
        _db.Incidents.Insert(0, inc);
        _db.Feed.Insert(0, new FeedItem { T = DateTime.Now.ToString("HH:mm"), Actor = "op1", Text = $"Yeni müraciət: {inc.Title}", Tone = "info", Id = inc.Id });
        return CreatedAtAction(nameof(Get), new { id = inc.Id }, inc);
    }

    /// <summary>Operator qərarı: accept (təsnif/təyin) və ya reject (ləğv). Note məcburi.</summary>
    [HttpPost("{id}/decision")]
    public ActionResult<Incident> Decide(string id, IncidentDecisionRequest req)
    {
        var inc = _db.Incidents.FirstOrDefault(i => i.Id == id);
        if (inc is null) return NotFound();
        if (string.IsNullOrWhiteSpace(req.Note)) return BadRequest("Note (səbəb/qeyd) məcburidir.");

        var t = MockDataStore.NowT();
        if (req.Decision == "reject")
        {
            inc.Status = "cancelled";
            inc.CancelReason = req.Note;
            inc.Timeline.Add(new() { Step = "cancelled", Actor = "op1", T = t, Note = req.Note });
        }
        else // accept
        {
            if (!string.IsNullOrWhiteSpace(req.Cat)) inc.Cat = req.Cat;
            if (!string.IsNullOrWhiteSpace(req.Priority)) inc.Priority = req.Priority!;
            if (!string.IsNullOrWhiteSpace(req.Due)) inc.Due = req.Due!;
            inc.Timeline.Add(new() { Step = "classified", Actor = "op1", T = t, Note = req.Note });
            inc.Status = "classified";
            if (!string.IsNullOrWhiteSpace(req.Assignee))
            {
                inc.Assignee = req.Assignee;
                inc.Status = "assigned";
                var who = _db.Actors.FirstOrDefault(a => a.Id == req.Assignee)?.Name ?? req.Assignee!;
                inc.Timeline.Add(new() { Step = "assigned", Actor = "op1", T = t, Note = $"{who} təyin edildi." });
            }
        }
        return inc;
    }

    /// <summary>Sahə redaktəsi: təsnifat / prioritet / icraçı / deadline-ı
    /// statusu dəyişmədən yenilə (web drawer İdarəetmə əməliyyatları). Yalnız
    /// göndərilən sahələr dəyişir; icraçını silmək üçün assigneeSet=true + assignee=null.</summary>
    [HttpPatch("{id}")]
    public ActionResult<Incident> Patch(string id, [FromBody] IncidentPatchRequest req)
    {
        var inc = _db.Incidents.FirstOrDefault(i => i.Id == id);
        if (inc is null) return NotFound();
        var t = MockDataStore.NowT();
        if (req.Cat is not null)
        {
            inc.Cat = req.Cat;
            inc.Timeline.Add(new() { Step = inc.Status, Actor = "op1", T = t, Note = "Yenidən təsnif: " + req.Cat });
        }
        if (req.Priority is not null) inc.Priority = req.Priority;
        if (req.Due is not null) inc.Due = req.Due;
        if (req.AssigneeSet)
        {
            inc.Assignee = string.IsNullOrWhiteSpace(req.Assignee) ? null : req.Assignee;
            if (inc.Assignee is not null)
            {
                var who = _db.Actors.FirstOrDefault(a => a.Id == inc.Assignee)?.Name ?? inc.Assignee;
                inc.Timeline.Add(new() { Step = "assigned", Actor = "op1", T = t, Note = $"{who} təyin edildi." });
            }
            else
            {
                inc.Timeline.Add(new() { Step = inc.Status, Actor = "op1", T = t, Note = "İcraçı təyinatı silindi." });
            }
        }
        return inc;
    }

    /// <summary>Statusu birbaşa irəli apar (nümayəndə sahə əməliyyatları üçün).</summary>
    [HttpPost("{id}/status")]
    public ActionResult<Incident> Advance(string id, [FromBody] StatusChangeRequest req)
    {
        var inc = _db.Incidents.FirstOrDefault(i => i.Id == id);
        if (inc is null) return NotFound();
        inc.Status = req.Status;
        inc.Timeline.Add(new() { Step = req.Status, Actor = req.Actor ?? inc.Assignee ?? "sys", T = MockDataStore.NowT(), Note = req.Note ?? "" });
        return inc;
    }
}

/// <summary>Sahə redaktəsi DTO (web drawer). Yalnız null olmayan sahələr tətbiq olunur.</summary>
public class IncidentPatchRequest
{
    public string? Cat { get; set; }
    public string? Priority { get; set; }
    public string? Due { get; set; }
    public string? Assignee { get; set; }
    public bool AssigneeSet { get; set; } // assignee dəyişib-dəyişmədiyini ayırd et (null = təyinatı sil)
}

/// <summary>Status irəlilətmə DTO (sahə nümayəndəsi).</summary>
public class StatusChangeRequest
{
    public string Status { get; set; } = "";
    public string? Actor { get; set; }
    public string? Note { get; set; }
}
