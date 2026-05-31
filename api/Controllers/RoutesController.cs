using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;
using Route = NerimanovOps.Api.Models.Route;

namespace NerimanovOps.Api.Controllers;

/// <summary>Admin → Marşrut (CRUD). Oxlarla çəkilən status axını (node + transition).</summary>
[ApiController]
[Route("api/routes")]
public class RoutesController : ControllerBase
{
    private readonly MockDataStore _db;
    public RoutesController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<Route> List() => _db.Routes;

    [HttpGet("{id}")]
    public ActionResult<Route> Get(string id)
    {
        var r = _db.Routes.FirstOrDefault(x => x.Id == id);
        return r is null ? NotFound() : r;
    }

    [HttpPost]
    public ActionResult<Route> Create(Route r)
    {
        if (string.IsNullOrWhiteSpace(r.Id)) r.Id = _db.NextId("R");
        _db.Routes.Add(r);
        return CreatedAtAction(nameof(Get), new { id = r.Id }, r);
    }

    /// <summary>Marşrutu tam əvəz et (ox redaktorunda saxla — node + transition).</summary>
    [HttpPut("{id}")]
    public ActionResult<Route> Update(string id, Route r)
    {
        var existing = _db.Routes.FirstOrDefault(x => x.Id == id);
        if (existing is null) return NotFound();
        existing.Name = r.Name;
        existing.Description = r.Description;
        existing.Type = r.Type;
        existing.Steps = r.Steps;
        existing.Transitions = r.Transitions;
        return existing;
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var r = _db.Routes.FirstOrDefault(x => x.Id == id);
        if (r is null) return NotFound();
        if (_db.Nomenclatures.Any(n => n.RouteId == id))
            return Conflict("Bu marşrut bir nameklatura bağlıdır — əvvəlcə bağlantını silin.");
        _db.Routes.Remove(r);
        return NoContent();
    }
}
