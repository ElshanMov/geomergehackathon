namespace NerimanovOps.Api.Models;

/// <summary>Admin → Nameklatur (təsnifat). Hər nameklaturun BİR marşrutu var.</summary>
public class Nomenclature
{
    public string Id { get; set; } = "";
    public string Code { get; set; } = "";       // KOM-SU
    public string Name { get; set; } = "";       // Kommunal / Su təchizatı
    public string Group { get; set; } = "";       // valideyn qrup (Kommunal)
    public string DefaultPriority { get; set; } = "normal";
    public int SlaHours { get; set; } = 48;
    public string? RouteId { get; set; }          // bağlı marşrut (1:1)
    public string Description { get; set; } = "";
    public bool Active { get; set; } = true;
}

/// <summary>Admin → Marşrut (oxlarla çəkilən status axını). Node + transition.</summary>
public class Route
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Type { get; set; } = "sequential"; // sequential | parallel
    public List<RouteStep> Steps { get; set; } = new();
    public List<RouteTransition> Transitions { get; set; } = new();
}

/// <summary>Marşrutdakı status node-u (canvas-da pill).</summary>
public class RouteStep
{
    public string Id { get; set; } = "";
    public string Code { get; set; } = "";    // status kodu
    public string Name { get; set; } = "";    // görünən ad
    public string Type { get; set; } = "normal"; // start | normal | external | end
    public string Role { get; set; } = "";    // icraçı rol
    public string Color { get; set; } = "#3B82F6";
    public double X { get; set; }             // canvas mövqeyi
    public double Y { get; set; }
}

/// <summary>İki status arasında keçid (ox/edge).</summary>
public class RouteTransition
{
    public string Id { get; set; } = "";
    public string From { get; set; } = "";    // RouteStep.Id
    public string To { get; set; } = "";      // RouteStep.Id
    public string Label { get; set; } = "";
    public string Kind { get; set; } = "internal"; // internal (RİH daxili) | external (quruma göndərmə)
}
