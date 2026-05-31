using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Cockpit üst panel: KPI, activity feed, hava, trafik, lifecycle, aktorlar.</summary>
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly MockDataStore _db;
    public DashboardController(MockDataStore db) => _db = db;

    [HttpGet("kpis")]
    public IEnumerable<Kpi> Kpis() => _db.Kpis;

    [HttpGet("feed")]
    public IEnumerable<FeedItem> Feed() => _db.Feed;

    [HttpGet("weather")]
    public Weather Weather() => _db.Weather;

    [HttpGet("traffic")]
    public IEnumerable<double> Traffic() => _db.TrafficSeries;

    [HttpGet("lifecycle")]
    public IEnumerable<LifecycleStep> Lifecycle() => _db.Lifecycle;

    [HttpGet("summary")]
    public object Summary() => new
    {
        kpis = _db.Kpis,
        feed = _db.Feed,
        weather = _db.Weather,
        traffic = _db.TrafficSeries,
        lifecycle = _db.Lifecycle,
        actors = _db.Actors,
        counts = new
        {
            open = _db.Incidents.Count(i => i.Status is not ("resolved" or "archived" or "cancelled")),
            urgent = _db.Incidents.Count(i => i.Priority == "urgent" && i.Status is not ("resolved" or "archived" or "cancelled")),
            resolvedToday = _db.Incidents.Count(i => i.Status == "resolved"),
            slaRisk = _db.Incidents.Count(i => i.Sla == "risk"),
        }
    };
}

/// <summary>Aktorlar (operator / nümayəndə / AI / sistem) — timeline və feed üçün lüğət.</summary>
[ApiController]
[Route("api/actors")]
public class ActorsController : ControllerBase
{
    private readonly MockDataStore _db;
    public ActorsController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<Actor> List() => _db.Actors;
}
