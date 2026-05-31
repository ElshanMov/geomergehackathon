namespace NerimanovOps.Api.Models;

/// <summary>Cockpit KPI kartı (sparkline + delta).</summary>
public class Kpi
{
    public string Id { get; set; } = "";
    public string Label { get; set; } = "";
    public double Value { get; set; }
    public double Delta { get; set; }
    public string Unit { get; set; } = "";
    public string Tone { get; set; } = "info"; // info | success | warning | accent
    public List<double> Spark { get; set; } = new();
}

/// <summary>Activity feed elementi (Bu gün diqqət tələb edənlər).</summary>
public class FeedItem
{
    public string T { get; set; } = "";
    public string Actor { get; set; } = "";
    public string Text { get; set; } = "";
    public string Tone { get; set; } = "info";
    public string Id { get; set; } = "";   // əlaqəli incident id
}

/// <summary>Üst banner hava + daşqın riski.</summary>
public class Weather
{
    public int Temp { get; set; }
    public string Cond { get; set; } = "";
    public int Rain { get; set; }
    public int Wind { get; set; }
    public string Flood { get; set; } = "Aşağı";
}

/// <summary>10 addımlı lifecycle metası (badge/stepper rəngləri).</summary>
public class LifecycleStep
{
    public string Id { get; set; } = "";
    public string Label { get; set; } = "";
    public string Color { get; set; } = "#64748B";
}

/// <summary>Yaxınlıqdakı problem (mobile ana səhifə + Waze-tipli trigger).</summary>
public class NearbyProblem
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "#0EA5E9";
    public int DistanceM { get; set; }
    public string Addr { get; set; } = "";
    public double Lng { get; set; }
    public double Lat { get; set; }
}

/// <summary>Faydalı kontakt (mobile profil → birbaşa zəng).</summary>
public class Contact
{
    public string Number { get; set; } = "";
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "";
}
