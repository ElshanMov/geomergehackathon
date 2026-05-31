using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Admin → İşçilərin siyahısı (CRUD). RİH əməkdaşları / sahə nümayəndələri.</summary>
[ApiController]
[Route("api/workers")]
public class WorkersController : ControllerBase
{
    private readonly MockDataStore _db;
    public WorkersController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<Worker> List([FromQuery] string? status, [FromQuery] string? department)
    {
        IEnumerable<Worker> items = _db.Workers;
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(w => w.Status == status);
        if (!string.IsNullOrWhiteSpace(department)) items = items.Where(w => w.Department == department);
        return items.ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<Worker> Get(string id)
    {
        var w = _db.Workers.FirstOrDefault(x => x.Id == id);
        return w is null ? NotFound() : w;
    }

    [HttpPost]
    public ActionResult<Worker> Create(Worker w)
    {
        if (string.IsNullOrWhiteSpace(w.Id)) w.Id = _db.NextId("W");
        if (string.IsNullOrWhiteSpace(w.Init)) w.Init = Initials(w.FullName);
        _db.Workers.Add(w);
        return CreatedAtAction(nameof(Get), new { id = w.Id }, w);
    }

    [HttpPut("{id}")]
    public ActionResult<Worker> Update(string id, Worker w)
    {
        var existing = _db.Workers.FirstOrDefault(x => x.Id == id);
        if (existing is null) return NotFound();
        existing.FullName = w.FullName;
        existing.Position = w.Position;
        existing.Department = w.Department;
        existing.Phone = w.Phone;
        existing.Email = w.Email;
        existing.Zone = w.Zone;
        existing.Status = w.Status;
        existing.OpenTasks = w.OpenTasks;
        existing.Init = string.IsNullOrWhiteSpace(w.Init) ? Initials(w.FullName) : w.Init;
        return existing;
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var w = _db.Workers.FirstOrDefault(x => x.Id == id);
        if (w is null) return NotFound();
        _db.Workers.Remove(w);
        return NoContent();
    }

    private static string Initials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length == 0 ? "?" : string.Concat(parts.Take(2).Select(p => char.ToUpper(p[0])));
    }
}
