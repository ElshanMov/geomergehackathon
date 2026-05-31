namespace NerimanovOps.Api.Models;

/// <summary>Xəritə təbəqəsi (15 təbəqə, operativ/əlavə qrup).</summary>
public class Layer
{
    public string Id { get; set; } = "";    // L1..L15
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "";   // lucide adı
    public bool On { get; set; }
    public string Color { get; set; } = "#64748B";
    public string Group { get; set; } = "operativ"; // operativ | elave
}

/// <summary>Təbəqənin xəritə üzərindəki mock geo-obyekti.</summary>
public class LayerFeature
{
    public string LayerId { get; set; } = "";
    public string Kind { get; set; } = "marker"; // marker | radius | line | polygon | heat
    public double Lng { get; set; }
    public double Lat { get; set; }
    public string Color { get; set; } = "#64748B";
    public int? Meters { get; set; }
    public string? Icon { get; set; }
    public bool Halo { get; set; }
    public string Label { get; set; } = "";
    public string Sub { get; set; } = "";
    public List<List<double>>? Coords { get; set; } // polygon üçün [[lng,lat],...]
}
