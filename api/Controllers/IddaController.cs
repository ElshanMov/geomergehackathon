using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>İDDA Gateway: başqa quruma göndərilən sənədlər + status izləmə.</summary>
[ApiController]
[Route("api/idda")]
public class IddaController : ControllerBase
{
    private readonly MockDataStore _db;
    public IddaController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<IddaDocument> List([FromQuery] string? status)
    {
        IEnumerable<IddaDocument> items = _db.IddaDocuments;
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(d => d.Status == status);
        return items.ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<IddaDocument> Get(string id)
    {
        var d = _db.IddaDocuments.FirstOrDefault(x => x.Id == id);
        return d is null ? NotFound() : d;
    }

    /// <summary>3 addımlı wizard nəticəsi — yeni İDDA sənədi göndər (status = SENT).</summary>
    [HttpPost]
    public ActionResult<IddaDocument> Create(CreateIddaRequest req)
    {
        var doc = new IddaDocument
        {
            Id = _db.NextId("IDDA"),
            Subject = req.Subject,
            Content = req.Content,
            RecipientOrg = req.RecipientOrg,
            RecipientType = string.IsNullOrWhiteSpace(req.RecipientType) ? "org" : req.RecipientType,
            Sender = "Leyla Məmmədova",
            SignatureType = req.SignatureType,
            Status = "SENT",
            CreatedAt = MockDataStore.NowStamp(),
            IncidentId = req.IncidentId,
            Timeline = new()
            {
                new() { Status = "SENT", T = MockDataStore.NowT(), Actor = "Leyla Məmmədova", Note = $"{req.SignatureType} ilə imzalanıb göndərildi." }
            }
        };
        _db.IddaDocuments.Insert(0, doc);
        return CreatedAtAction(nameof(Get), new { id = doc.Id }, doc);
    }

    /// <summary>Sənədin statusunu irəlilət (qəbul edən qurumdan gələn addım).</summary>
    [HttpPost("{id}/advance")]
    public ActionResult<IddaDocument> Advance(string id, [FromBody] IddaStep step)
    {
        var doc = _db.IddaDocuments.FirstOrDefault(x => x.Id == id);
        if (doc is null) return NotFound();
        doc.Status = step.Status;
        step.T = string.IsNullOrWhiteSpace(step.T) ? MockDataStore.NowT() : step.T;
        doc.Timeline.Add(step);
        return doc;
    }
}

/// <summary>Qəbul edən təşkilatlar (İDDA alıcı seçimi).</summary>
[ApiController]
[Route("api/organizations")]
public class OrganizationsController : ControllerBase
{
    private readonly MockDataStore _db;
    public OrganizationsController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<Organization> List() => _db.Organizations;
}
