using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Xəritə təbəqələri (15 təbəqə) və onların geo-obyektləri.</summary>
[ApiController]
[Route("api/layers")]
public class LayersController : ControllerBase
{
    private readonly MockDataStore _db;
    public LayersController(MockDataStore db) => _db = db;

    /// <summary>Təbəqə siyahısı (operativ + əlavə qruplar).</summary>
    [HttpGet]
    public IEnumerable<Layer> List() => _db.Layers;

    /// <summary>Bütün geo-obyektlər (incident-lər ayrıca /api/incidents-dən gəlir).</summary>
    [HttpGet("features")]
    public IEnumerable<LayerFeature> Features([FromQuery] string? layerId) =>
        string.IsNullOrWhiteSpace(layerId) ? _db.LayerFeatures : _db.LayerFeatures.Where(f => f.LayerId == layerId);

    /// <summary>Təbəqəni aç/bağla (cockpit toggle).</summary>
    [HttpPost("{id}/toggle")]
    public ActionResult<Layer> Toggle(string id, [FromBody] ToggleRequest req)
    {
        var layer = _db.Layers.FirstOrDefault(l => l.Id == id);
        if (layer is null) return NotFound();
        layer.On = req.On;
        return layer;
    }
}

public class ToggleRequest
{
    public bool On { get; set; }
}
