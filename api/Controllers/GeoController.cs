using Microsoft.AspNetCore.Mvc;

namespace NerimanovOps.Api.Controllers;

/// <summary>Statik GeoJSON sərhədləri (Nərimanov rayonu spotlight effekti üçün).</summary>
[ApiController]
[Route("api/geo")]
public class GeoController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    public GeoController(IWebHostEnvironment env) => _env = env;

    [HttpGet("narimanov")]
    public IActionResult Narimanov()
    {
        var path = Path.Combine(_env.ContentRootPath, "Data", "narimanov.geojson");
        if (!System.IO.File.Exists(path)) return NotFound();
        return Content(System.IO.File.ReadAllText(path), "application/json");
    }
}
