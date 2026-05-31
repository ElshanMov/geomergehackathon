using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Admin → Nameklatur (CRUD). Hər nameklaturun BİR marşrutu var (RouteId).</summary>
[ApiController]
[Route("api/nomenclatures")]
public class NomenclaturesController : ControllerBase
{
    private readonly MockDataStore _db;
    public NomenclaturesController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<Nomenclature> List([FromQuery] string? group, [FromQuery] bool? active)
    {
        IEnumerable<Nomenclature> items = _db.Nomenclatures;
        if (!string.IsNullOrWhiteSpace(group)) items = items.Where(n => n.Group == group);
        if (active.HasValue) items = items.Where(n => n.Active == active.Value);
        return items.ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<Nomenclature> Get(string id)
    {
        var n = _db.Nomenclatures.FirstOrDefault(x => x.Id == id);
        return n is null ? NotFound() : n;
    }

    [HttpPost]
    public ActionResult<Nomenclature> Create(Nomenclature n)
    {
        if (string.IsNullOrWhiteSpace(n.Id)) n.Id = _db.NextId("NC");
        _db.Nomenclatures.Add(n);
        return CreatedAtAction(nameof(Get), new { id = n.Id }, n);
    }

    [HttpPut("{id}")]
    public ActionResult<Nomenclature> Update(string id, Nomenclature n)
    {
        var existing = _db.Nomenclatures.FirstOrDefault(x => x.Id == id);
        if (existing is null) return NotFound();
        existing.Code = n.Code;
        existing.Name = n.Name;
        existing.Group = n.Group;
        existing.DefaultPriority = n.DefaultPriority;
        existing.SlaHours = n.SlaHours;
        existing.RouteId = n.RouteId;
        existing.Description = n.Description;
        existing.Active = n.Active;
        return existing;
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var n = _db.Nomenclatures.FirstOrDefault(x => x.Id == id);
        if (n is null) return NotFound();
        _db.Nomenclatures.Remove(n);
        return NoContent();
    }
}
