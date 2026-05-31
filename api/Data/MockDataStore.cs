using NerimanovOps.Api.Models;
using Route = NerimanovOps.Api.Models.Route;

namespace NerimanovOps.Api.Data;

/// <summary>
/// Bütün mock datanın TƏK mənbəyi (in-memory singleton). SQL yoxdur.
/// data.js + narimanov.json məzmunu burada seed olunur, üstəlik admin entity-ləri.
/// </summary>
public class MockDataStore
{
    public List<Actor> Actors { get; } = new();
    public List<Incident> Incidents { get; } = new();
    public List<Layer> Layers { get; } = new();
    public List<LayerFeature> LayerFeatures { get; } = new();
    public List<Kpi> Kpis { get; } = new();
    public List<FeedItem> Feed { get; } = new();
    public Weather Weather { get; private set; } = new();
    public List<double> TrafficSeries { get; } = new() { 42, 48, 55, 61, 58, 52, 49, 57, 64, 71, 68, 60 };
    public List<LifecycleStep> Lifecycle { get; } = new();

    public List<SystemUser> Users { get; } = new();
    public List<Worker> Workers { get; } = new();
    public List<LdapUser> LdapUsers { get; } = new();
    public List<Nomenclature> Nomenclatures { get; } = new();
    public List<Route> Routes { get; } = new();
    public List<Role> Roles { get; } = new();
    public List<RolePermission> Permissions { get; } = new();
    public PasswordPolicy PasswordPolicy { get; set; } = new();
    public List<IddaDocument> IddaDocuments { get; } = new();
    public List<Organization> Organizations { get; } = new();
    public List<Conversation> Conversations { get; } = new();
    public List<NearbyProblem> NearbyProblems { get; } = new();
    public List<Contact> Contacts { get; } = new();

    private int _seq = 1000;
    public string NextId(string prefix) => $"{prefix}-{++_seq}";

    private static readonly string[] AzMonths =
        { "Yan", "Fev", "Mar", "Apr", "May", "İyun", "İyul", "Avq", "Sen", "Okt", "Noy", "Dek" };

    /// <summary>"31 May, 14:05" — incident.Created / idda.CreatedAt formatı.</summary>
    public static string NowStamp() { var n = DateTime.Now; return $"{n.Day} {AzMonths[n.Month - 1]}, {n:HH:mm}"; }

    /// <summary>"31 May 14:05" — timeline.T formatı.</summary>
    public static string NowT() { var n = DateTime.Now; return $"{n.Day} {AzMonths[n.Month - 1]} {n:HH:mm}"; }

    public MockDataStore()
    {
        SeedActors();
        SeedLifecycle();
        SeedIncidents();
        SeedLayers();
        SeedDashboard();
        SeedUsers();
        SeedWorkers();
        SeedLdap();
        SeedWorkflow();
        SeedPrivileges();
        SeedIdda();
        SeedConversations();
        SeedMobile();
    }

    private static TimelineStep TS(string step, string actor, string t, string note) =>
        new() { Step = step, Actor = actor, T = t, Note = note };

    private void SeedActors()
    {
        Actors.AddRange(new[]
        {
            new Actor { Id = "op1",  Name = "Leyla Məmmədova", Role = "RİH operatoru",   Init = "LM", Color = "#0EA5E9" },
            new Actor { Id = "op2",  Name = "Rəşad Quliyev",   Role = "RİH operatoru",   Init = "RQ", Color = "#8B5CF6" },
            new Actor { Id = "rep1", Name = "Elçin Hüseynov",  Role = "RİH nümayəndəsi", Init = "EH", Color = "#10B981" },
            new Actor { Id = "rep2", Name = "Nigar Əliyeva",   Role = "RİH nümayəndəsi", Init = "NƏ", Color = "#F59E0B" },
            new Actor { Id = "rep3", Name = "Tural Bağırov",   Role = "RİH nümayəndəsi", Init = "TB", Color = "#3B82F6" },
            new Actor { Id = "ai",   Name = "AI Detektor",     Role = "Avtomatik sistem",Init = "AI", Color = "#F59E0B" },
            new Actor { Id = "sys",  Name = "Sistem",          Role = "Avtomatik",       Init = "SY", Color = "#64748B" },
        });
    }

    private void SeedLifecycle()
    {
        Lifecycle.AddRange(new[]
        {
            new LifecycleStep { Id = "new",        Label = "Yeni",               Color = "#64748B" },
            new LifecycleStep { Id = "registered", Label = "Qeydiyyata alındı",  Color = "#3B82F6" },
            new LifecycleStep { Id = "classified", Label = "Təsnif edildi",       Color = "#0EA5E9" },
            new LifecycleStep { Id = "assigned",   Label = "İcraçıya təyin",      Color = "#8B5CF6" },
            new LifecycleStep { Id = "enroute",    Label = "Marşrutda",           Color = "#A855F7" },
            new LifecycleStep { Id = "onsite",     Label = "Sahədə baxış",        Color = "#F59E0B" },
            new LifecycleStep { Id = "inprogress", Label = "İcrada",              Color = "#F97316" },
            new LifecycleStep { Id = "review",     Label = "Yoxlamada",           Color = "#EAB308" },
            new LifecycleStep { Id = "resolved",   Label = "Həll edildi",         Color = "#10B981" },
            new LifecycleStep { Id = "archived",   Label = "Arxivləşdirildi",     Color = "#94A3B8" },
        });
    }

    private void SeedIncidents()
    {
        Incidents.Add(new Incident
        {
            Id = "NRM-24817", Reg = "4019-2026-N", Title = "Su sızması — magistral boru qəzası",
            Cat = "Kommunal / Su təchizatı", Priority = "urgent", Status = "inprogress", Layer = "L3",
            Lng = 49.8472, Lat = 40.4121, Addr = "Atatürk prospekti 24, Nərimanov",
            Created = "30 May, 08:12", Due = "30 May, 18:00", Reporter = "Vətəndaş · Anar S.",
            Assignee = "rep1", Sla = "risk",
            Desc = "Magistral boru xətti partlayıb, yol səthinə su axır. Nəqliyyat hərəkəti çətinləşib. Təcili müdaxilə tələb olunur.",
            Photos = 2,
            Timeline = new()
            {
                TS("new","op1","30 May 08:12","Vətəndaş müraciəti qəbul edildi (kamera ilə)."),
                TS("registered","op1","30 May 08:15","Qeydiyyat nömrəsi verildi: 4019-2026-N"),
                TS("classified","op1","30 May 08:18","Təsnifat: Kommunal / Su təchizatı. Prioritet: Təcili."),
                TS("assigned","op1","30 May 08:20","Elçin Hüseynov təyin edildi. Deadline: 18:00."),
                TS("enroute","rep1","30 May 08:34","Marşruta çıxdım."),
                TS("onsite","rep1","30 May 09:05","Sahəyə çatdım, vəziyyət təsdiqləndi. Foto əlavə olundu."),
                TS("inprogress","rep1","30 May 09:40","«Azərsu» briqadası cəlb olundu, təmir başladı."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24816", Reg = "4018-2026-N", Title = "İcazəsiz tikinti — 3 mərtəbəli artırma",
            Cat = "Şəhərsalma / Qanunsuz tikinti", Priority = "high", Status = "onsite", Layer = "L4",
            Lng = 49.8602, Lat = 40.4067, Addr = "Fətəli Xan Xoyski 145, Nərimanov",
            Created = "30 May, 07:40", Due = "02 İyun, 17:00", Reporter = "AI Detektor (94% confidence)",
            Assignee = "rep2", Sla = "ok", AiConfidence = 94,
            Desc = "AI peyk təhlili: mövcud binaya icazəsiz 3 mərtəbə artırma aşkarlandı. Reyestrdə uyğun icazə tapılmadı.",
            Photos = 3,
            Timeline = new()
            {
                TS("new","ai","30 May 07:40","AI peyk skanı: potensial qanunsuz tikinti (94%)."),
                TS("registered","sys","30 May 07:41","Avtomatik qeydiyyat: 4018-2026-N"),
                TS("classified","op2","30 May 08:02","Şəhərsalma / Qanunsuz tikinti təsdiqləndi."),
                TS("assigned","op2","30 May 08:10","Nigar Əliyeva sahə baxışına təyin edildi."),
                TS("enroute","rep2","30 May 08:55","Marşruta çıxdım."),
                TS("onsite","rep2","30 May 09:30","Sahədə yoxlama gedir, AI nəticəsi təsdiqlənir."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24815", Reg = "4017-2026-N", Title = "Ağac aşması — səki bağlanıb",
            Cat = "Abadlıq / Yaşıllıq", Priority = "high", Status = "assigned", Layer = "L1",
            Lng = 49.864, Lat = 40.404, Addr = "Ziya Bünyadov prospekti 19, Nərimanov",
            Created = "30 May, 09:25", Due = "30 May, 20:00", Reporter = "Vətəndaş · Səbinə R.",
            Assignee = "rep3", Sla = "ok",
            Desc = "Güclü küləkdən sonra böyük ağac səkiyə yıxılıb, piyada keçidi bağlıdır.",
            Photos = 1,
            Timeline = new()
            {
                TS("new","op1","30 May 09:25","Vətəndaş müraciəti qəbul edildi."),
                TS("registered","op1","30 May 09:27","Qeydiyyat: 4017-2026-N"),
                TS("classified","op1","30 May 09:31","Abadlıq / Yaşıllıq təsnifatı."),
                TS("assigned","op1","30 May 09:35","Tural Bağırov təyin edildi."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24814", Reg = "4016-2026-N", Title = "İşıqforun sıradan çıxması",
            Cat = "Nəqliyyat / Yol infrastrukturu", Priority = "normal", Status = "registered", Layer = "L1",
            Lng = 49.870, Lat = 40.416, Addr = "Koroğlu Rəhimov küçəsi 8, Nərimanov",
            Created = "30 May, 10:02", Due = "31 May, 12:00", Reporter = "Vətəndaş · Murad T.",
            Assignee = null, Sla = "ok", Desc = "Keçiddə işıqfor işləmir, sıxlıq yaranır.", Photos = 1,
            Timeline = new()
            {
                TS("new","op2","30 May 10:02","Müraciət qəbul edildi."),
                TS("registered","op2","30 May 10:05","Qeydiyyat: 4016-2026-N"),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24813", Reg = "4015-2026-N", Title = "Zibil yığılması — konteyner aşıb",
            Cat = "Təmizlik / Tullantı", Priority = "normal", Status = "resolved", Layer = "L1",
            Lng = 49.8489, Lat = 40.4051, Addr = "Həsən bəy Zərdabi 56, Nərimanov",
            Created = "29 May, 16:20", Due = "30 May, 10:00", Reporter = "Vətəndaş · Kamran V.",
            Assignee = "rep1", Sla = "ok", Desc = "Konteyner aşıb, tullantı səkiyə dağılıb.", Photos = 2,
            Timeline = new()
            {
                TS("new","op1","29 May 16:20","Müraciət qəbul edildi."),
                TS("registered","op1","29 May 16:22","Qeydiyyat: 4015-2026-N"),
                TS("classified","op1","29 May 16:30","Təmizlik / Tullantı."),
                TS("assigned","op1","29 May 16:40","Elçin Hüseynov təyin edildi."),
                TS("inprogress","rep1","30 May 08:10","Təmizlik briqadası işə başladı."),
                TS("resolved","rep1","30 May 09:15","Ərazi təmizləndi, foto əlavə olundu."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24812", Reg = "4014-2026-N", Title = "Asfalt çökməsi — çuxur",
            Cat = "Nəqliyyat / Yol infrastrukturu", Priority = "high", Status = "inprogress", Layer = "L2",
            Lng = 49.8388, Lat = 40.4098, Addr = "Qara Qarayev prospekti 102, Nərimanov",
            Created = "29 May, 14:10", Due = "31 May, 17:00", Reporter = "RİH əməkdaşı · monitorinq",
            Assignee = "rep3", Sla = "ok", Desc = "Yol səthində böyük çökmə, nəqliyyat üçün təhlükə.", Photos = 2,
            Timeline = new()
            {
                TS("new","op2","29 May 14:10","Monitorinq zamanı aşkarlandı."),
                TS("registered","op2","29 May 14:12","Qeydiyyat: 4014-2026-N"),
                TS("classified","op2","29 May 14:20","Yol infrastrukturu."),
                TS("assigned","op2","29 May 14:30","Tural Bağırov təyin edildi."),
                TS("inprogress","rep3","30 May 07:50","Təmir işləri davam edir."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24811", Reg = "4013-2026-N", Title = "Sahibsiz it toplanması — məktəb yaxınlığı",
            Cat = "Sanitar / Heyvanlar", Priority = "normal", Status = "classified", Layer = "L1",
            Lng = 49.8635, Lat = 40.4142, Addr = "Əhməd Rəcəbli 41, Nərimanov",
            Created = "30 May, 09:50", Due = "01 İyun, 12:00", Reporter = "Vətəndaş · Aysel M.",
            Assignee = null, Sla = "ok", Desc = "5-6 sahibsiz it toplaşıb, məktəblilərin keçidində narahatlıq.", Photos = 1,
            Timeline = new()
            {
                TS("new","op1","30 May 09:50","Müraciət qəbul edildi."),
                TS("registered","op1","30 May 09:52","Qeydiyyat: 4013-2026-N"),
                TS("classified","op1","30 May 10:01","Sanitar / Heyvanlar təsnifatı."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24810", Reg = "4012-2026-N", Title = "İcazəsiz reklam lövhəsi",
            Cat = "Şəhərsalma / Reklam", Priority = "low", Status = "new", Layer = "L1",
            Lng = 49.8521, Lat = 40.4035, Addr = "Bakıxanov küçəsi 12, Nərimanov",
            Created = "30 May, 10:18", Due = "03 İyun, 17:00", Reporter = "Vətəndaş · Orxan B.",
            Assignee = null, Sla = "ok", Desc = "Fasadda lisenziyasız reklam konstruksiyası quraşdırılıb.", Photos = 1,
            Timeline = new() { TS("new","op2","30 May 10:18","Müraciət qəbul edildi, təsnifat gözləyir.") }
        });
        // Arxiv + ləğv
        Incidents.Add(new Incident
        {
            Id = "NRM-24788", Reg = "3990-2026-N", Title = "Səki plitələrinin təmiri",
            Cat = "Abadlıq / İnfrastruktur", Priority = "normal", Status = "archived", Layer = "L2",
            Lng = 49.8512, Lat = 40.4170, Addr = "Təbriz küçəsi 9, Nərimanov",
            Created = "24 May, 11:00", Due = "28 May, 17:00", Reporter = "Vətəndaş · Vüsal H.",
            Assignee = "rep2", Sla = "ok", Desc = "Səki plitələri qırılıb, dəyişdirildi və ərazi arxivləşdirildi.", Photos = 2,
            Timeline = new()
            {
                TS("new","op1","24 May 11:00","Müraciət qəbul edildi."),
                TS("resolved","rep2","27 May 15:20","İşlər tamamlandı."),
                TS("archived","sys","28 May 09:00","Müraciət arxivləşdirildi."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24770", Reg = "3972-2026-N", Title = "Dublikat müraciət — zibil konteyneri",
            Cat = "Təmizlik / Tullantı", Priority = "low", Status = "cancelled", Layer = "L1",
            Lng = 49.8470, Lat = 40.4040, Addr = "Həsən bəy Zərdabi 58, Nərimanov",
            Created = "23 May, 09:40", Due = "—", Reporter = "Vətəndaş · Anonim",
            Assignee = "op2", Sla = "ok", CancelReason = "NRM-24813 ilə eyni problem — dublikat olduğu üçün ləğv edildi.",
            Desc = "Eyni ünvanda mövcud müraciət olduğu üçün ləğv edildi.", Photos = 1,
            Timeline = new()
            {
                TS("new","op2","23 May 09:40","Müraciət qəbul edildi."),
                TS("registered","op2","23 May 09:48","Yoxlama zamanı dublikat aşkarlandı."),
            }
        });
        Incidents.Add(new Incident
        {
            Id = "NRM-24765", Reg = "3967-2026-N", Title = "Yağış suyu drenajının təmizlənməsi",
            Cat = "Kommunal / Drenaj", Priority = "high", Status = "archived", Layer = "L6",
            Lng = 49.8602, Lat = 40.4188, Addr = "Koroğlu Rəhimov 21, Nərimanov",
            Created = "20 May, 14:15", Due = "22 May, 17:00", Reporter = "RİH əməkdaşı",
            Assignee = "rep3", Sla = "ok", Desc = "Drenaj təmizləndi, daşqın riski aradan qaldırıldı, arxivləşdirildi.", Photos = 3,
            Timeline = new()
            {
                TS("new","op1","20 May 14:15","Müraciət qəbul edildi."),
                TS("resolved","rep3","22 May 12:00","Drenaj təmizləndi."),
                TS("archived","sys","23 May 08:00","Arxivləşdirildi."),
            }
        });
    }

    private void SeedLayers()
    {
        Layers.AddRange(new[]
        {
            new Layer { Id = "L1", Name = "Aktiv incidentlər",            Icon = "map-pin",        On = true,  Color = "#EF4444", Group = "operativ" },
            new Layer { Id = "L2", Name = "İş görülən hissələr",          Icon = "hard-hat",       On = true,  Color = "#0EA5E9", Group = "operativ" },
            new Layer { Id = "L3", Name = "Qəzalı vəziyyətlər",           Icon = "triangle-alert", On = true,  Color = "#DC2626", Group = "operativ" },
            new Layer { Id = "L4", Name = "Qanunsuz obyektlər (AI)",      Icon = "scan-line",      On = true,  Color = "#F59E0B", Group = "operativ" },
            new Layer { Id = "L5", Name = "Trafik sıxlığı",               Icon = "traffic-cone",   On = true,  Color = "#F97316", Group = "operativ" },
            new Layer { Id = "L6", Name = "Kəskin hava problemi riski",   Icon = "cloud-rain",     On = true,  Color = "#3B82F6", Group = "operativ" },
            new Layer { Id = "L8", Name = "Aktiv RİH nümayəndələri",      Icon = "user-round",     On = false, Color = "#8B5CF6", Group = "operativ" },
            new Layer { Id = "L7",  Name = "Planlı kommunal işlər",       Icon = "wrench",         On = false, Color = "#0EA5E9", Group = "elave" },
            new Layer { Id = "L10", Name = "Yaşıllıq dinamikası (NDVI)",  Icon = "trees",          On = false, Color = "#10B981", Group = "elave" },
            new Layer { Id = "L11", Name = "Tərk edilmiş əmlak",          Icon = "house",          On = false, Color = "#64748B", Group = "elave" },
            new Layer { Id = "L13", Name = "Sahibsiz heyvan klasterləri", Icon = "paw-print",      On = false, Color = "#A855F7", Group = "elave" },
            new Layer { Id = "L14", Name = "Tədbir və izdiham zonaları",  Icon = "users",          On = false, Color = "#EC4899", Group = "elave" },
            new Layer { Id = "L15", Name = "POI (məktəb, xəstəxana)",     Icon = "landmark",       On = false, Color = "#64748B", Group = "elave" },
        });

        void F(string id, string kind, double lng, double lat, string color, string label, string sub,
               int? meters = null, string? icon = null, bool halo = false, List<List<double>>? coords = null)
            => LayerFeatures.Add(new LayerFeature { LayerId = id, Kind = kind, Lng = lng, Lat = lat, Color = color, Label = label, Sub = sub, Meters = meters, Icon = icon, Halo = halo, Coords = coords });

        F("L2", "radius", 49.858, 40.404, "#0EA5E9", "Asfalt təmiri", "Qara Qarayev pr.", meters: 150);
        F("L2", "radius", 49.876, 40.408, "#0EA5E9", "Səki bərpası", "Atatürk pr.", meters: 120);
        F("L4", "marker", 49.852, 40.408, "#F59E0B", "AI: qanunsuz tikinti", "Ziya Bünyadov · 88%", icon: "scan-line", halo: true);
        F("L4", "marker", 49.882, 40.412, "#F59E0B", "AI: qanunsuz tikinti", "Koroğlu küç. · 76%", icon: "scan-line", halo: true);
        F("L6", "polygon", 0, 0, "#3B82F6", "Daşqın riski zonası", "Orta risk · drenaj",
          coords: new() { new() { 49.882, 40.420 }, new() { 49.894, 40.420 }, new() { 49.894, 40.428 }, new() { 49.882, 40.428 } });
        F("L7", "marker", 49.846, 40.400, "#0EA5E9", "Planlı qaz xətti işi", "«Azəriqaz» · 02 İyun", icon: "wrench");
        F("L7", "marker", 49.888, 40.416, "#0EA5E9", "Su xətti təmiri", "«Azərsu» · 03 İyun", icon: "wrench");
        F("L8", "marker", 49.8472, 40.4121, "#8B5CF6", "Elçin Hüseynov", "Sahədə · NRM-24817", icon: "user-round");
        F("L8", "marker", 49.8602, 40.4067, "#8B5CF6", "Nigar Əliyeva", "Sahədə · NRM-24816", icon: "user-round");
        F("L8", "marker", 49.870, 40.412, "#8B5CF6", "Tural Bağırov", "Marşrutda", icon: "user-round");
        F("L10", "polygon", 0, 0, "#10B981", "Yaşıllıq zonası", "NDVI sabit",
          coords: new() { new() { 49.864, 40.396 }, new() { 49.876, 40.396 }, new() { 49.876, 40.400 }, new() { 49.864, 40.400 } });
        F("L10", "polygon", 0, 0, "#F59E0B", "Azalan yaşıllıq", "NDVI ↓ 12%",
          coords: new() { new() { 49.870, 40.420 }, new() { 49.882, 40.420 }, new() { 49.882, 40.424 }, new() { 49.870, 40.424 } });
        F("L11", "marker", 49.840, 40.404, "#64748B", "Tərk edilmiş bina", "Statusu: baxış gözləyir", icon: "house");
        F("L11", "marker", 49.888, 40.420, "#64748B", "Tərk edilmiş obyekt", "Statusu: qeydiyyatda", icon: "house");
        F("L13", "marker", 49.846, 40.396, "#A855F7", "İt klasteri (≈6)", "Əhməd Rəcəbli", icon: "paw-print");
        F("L13", "marker", 49.876, 40.420, "#A855F7", "Pişik klasteri (≈4)", "Təbriz küç.", icon: "paw-print");
        F("L14", "radius", 49.870, 40.400, "#EC4899", "Tədbir zonası", "Şəhər bayramı · 31 May", meters: 220);
        F("L15", "marker", 49.858, 40.408, "#3B82F6", "Məktəb №220", "Təhsil", icon: "graduation-cap");
        F("L15", "marker", 49.876, 40.400, "#EF4444", "Poliklinika №12", "Səhiyyə", icon: "cross");
        F("L15", "marker", 49.864, 40.412, "#10B981", "Nərimanov parkı", "İstirahət", icon: "trees");
        F("L15", "marker", 49.870, 40.404, "#64748B", "RİH binası", "İnzibati", icon: "landmark");
    }

    private void SeedDashboard()
    {
        Kpis.AddRange(new[]
        {
            new Kpi { Id = "open",  Label = "Açıq sorğular",  Value = 142, Delta = 8,    Unit = "",  Tone = "info",    Spark = new() { 120,125,118,130,128,135,138,142 } },
            new Kpi { Id = "today", Label = "Bu gün həll",    Value = 37,  Delta = 12,   Unit = "",  Tone = "success", Spark = new() { 18,22,20,26,28,30,34,37 } },
            new Kpi { Id = "sla",   Label = "SLA breach",     Value = 6.4, Delta = -1.8, Unit = "%", Tone = "warning", Spark = new() { 9.1,8.6,8.2,7.9,7.4,7.0,6.7,6.4 } },
            new Kpi { Id = "score", Label = "NərimanovScore", Value = 87,  Delta = 3,    Unit = "",  Tone = "accent",  Spark = new() { 78,80,79,82,83,84,86,87 } },
        });
        Weather = new Weather { Temp = 24, Cond = "Qismən buludlu", Rain = 15, Wind = 18, Flood = "Aşağı" };
        Feed.AddRange(new[]
        {
            new FeedItem { T = "10:18", Actor = "op2",  Text = "Yeni müraciət: İcazəsiz reklam lövhəsi",   Tone = "info",    Id = "NRM-24810" },
            new FeedItem { T = "10:05", Actor = "op2",  Text = "İşıqfor nasazlığı qeydiyyata alındı",       Tone = "info",    Id = "NRM-24814" },
            new FeedItem { T = "10:01", Actor = "op1",  Text = "Sahibsiz it toplanması təsnif edildi",      Tone = "normal",  Id = "NRM-24811" },
            new FeedItem { T = "09:40", Actor = "rep1", Text = "Su sızması: «Azərsu» briqadası cəlb olundu", Tone = "urgent",  Id = "NRM-24817" },
            new FeedItem { T = "09:30", Actor = "rep2", Text = "AI tikinti aşkarı sahədə yoxlanılır",        Tone = "high",    Id = "NRM-24816" },
            new FeedItem { T = "09:15", Actor = "rep1", Text = "Zibil yığılması həll edildi",                Tone = "success", Id = "NRM-24813" },
            new FeedItem { T = "07:41", Actor = "ai",   Text = "AI Detektor: yeni qanunsuz tikinti (94%)",   Tone = "high",    Id = "NRM-24816" },
        });
    }

    private void SeedUsers()
    {
        Users.AddRange(new[]
        {
            new SystemUser { Id = "op1", FullName = "Leyla Məmmədova", Username = "leyla.m", Email = "leyla.mammadova@nerimanov.gov.az", Phone = "+994 50 111 22 33", Role = "operator", Department = "Operativ idarəetmə", Status = "active", Init = "LM", Color = "#0EA5E9", TwoFactor = true, CreatedAt = "12 Yan 2026", LastLogin = "30 May, 07:55" },
            new SystemUser { Id = "op2", FullName = "Rəşad Quliyev", Username = "reshad.q", Email = "reshad.quliyev@nerimanov.gov.az", Phone = "+994 55 222 33 44", Role = "operator", Department = "Operativ idarəetmə", Status = "active", Init = "RQ", Color = "#8B5CF6", TwoFactor = true, CreatedAt = "12 Yan 2026", LastLogin = "30 May, 08:40" },
            new SystemUser { Id = "adm1", FullName = "Kamran Nəbiyev", Username = "kamran.n", Email = "kamran.nabiyev@nerimanov.gov.az", Phone = "+994 50 333 44 55", Role = "admin", Department = "İnformasiya texnologiyaları", Status = "active", Init = "KN", Color = "#0F172A", TwoFactor = true, CreatedAt = "03 Yan 2026", LastLogin = "30 May, 09:10" },
            new SystemUser { Id = "rep1", FullName = "Elçin Hüseynov", Username = "elchin.h", Email = "elchin.huseynov@nerimanov.gov.az", Phone = "+994 51 444 55 66", Role = "representative", Department = "Sahə xidməti", Status = "active", Init = "EH", Color = "#10B981", TwoFactor = false, CreatedAt = "20 Yan 2026", LastLogin = "30 May, 08:34" },
            new SystemUser { Id = "rep2", FullName = "Nigar Əliyeva", Username = "nigar.a", Email = "nigar.aliyeva@nerimanov.gov.az", Phone = "+994 70 555 66 77", Role = "representative", Department = "Sahə xidməti", Status = "active", Init = "NƏ", Color = "#F59E0B", TwoFactor = false, CreatedAt = "20 Yan 2026", LastLogin = "30 May, 08:55" },
            new SystemUser { Id = "rep3", FullName = "Tural Bağırov", Username = "tural.b", Email = "tural.bagirov@nerimanov.gov.az", Phone = "+994 77 666 77 88", Role = "representative", Department = "Sahə xidməti", Status = "blocked", Init = "TB", Color = "#3B82F6", TwoFactor = false, CreatedAt = "01 Fev 2026", LastLogin = "28 May, 16:20" },
            new SystemUser { Id = "rep4", FullName = "Həbibullayev Elgin Şirin oğlu", Username = "elgin.h", Email = "elgin.h@nerimanov.gov.az", Phone = "+994 55 111 22 33", Role = "representative", Department = "Rəhbərlik", Status = "active", Init = "HE", Color = "#14B8A6", TwoFactor = false, CreatedAt = "31 May 2026", LastLogin = "31 May, 09:00" },
        });
        // Admin-də yaradılan RİH nümayəndələri cockpit-də (Actors) görünsün deyə sinxronlaşdır.
        foreach (var u in Users) SyncRepActor(u);
    }

    /// <summary>RİH nümayəndəsi olan istifadəçi üçün cockpit Actor-unu yarat/yenilə.
    /// Admin Panel-də əlavə edilən təyinatçı Web-də icraçı kimi görünsün deyə.</summary>
    public void SyncRepActor(SystemUser u)
    {
        if (u.Role != "representative")
        {
            RemoveActorForUser(u.Id);
            return;
        }
        var existing = Actors.FirstOrDefault(a => a.Id == u.Id);
        if (existing is null)
        {
            Actors.Add(new Actor { Id = u.Id, Name = u.FullName, Role = "RİH nümayəndəsi", Init = u.Init, Color = u.Color });
        }
        else
        {
            existing.Name = u.FullName;
            existing.Init = u.Init;
            existing.Color = u.Color;
        }
    }

    /// <summary>İstifadəçi silindikdə / nümayəndə olmadıqda uyğun Actor-u sil.</summary>
    public void RemoveActorForUser(string id)
    {
        var a = Actors.FirstOrDefault(x => x.Id == id);
        if (a is not null) Actors.Remove(a);
    }

    private void SeedWorkers()
    {
        Workers.AddRange(new[]
        {
            new Worker { Id = "W-101", FullName = "Elçin Hüseynov", Position = "Baş nümayəndə", Department = "Sahə xidməti", Phone = "+994 51 444 55 66", Email = "elchin.huseynov@nerimanov.gov.az", Zone = "Atatürk pr. ətrafı", Status = "active", Init = "EH", Color = "#10B981", OpenTasks = 3 },
            new Worker { Id = "W-102", FullName = "Nigar Əliyeva", Position = "Nümayəndə", Department = "Sahə xidməti", Phone = "+994 70 555 66 77", Email = "nigar.aliyeva@nerimanov.gov.az", Zone = "Fətəli Xan Xoyski", Status = "active", Init = "NƏ", Color = "#F59E0B", OpenTasks = 2 },
            new Worker { Id = "W-103", FullName = "Tural Bağırov", Position = "Nümayəndə", Department = "Sahə xidməti", Phone = "+994 77 666 77 88", Email = "tural.bagirov@nerimanov.gov.az", Zone = "Qara Qarayev pr.", Status = "leave", Init = "TB", Color = "#3B82F6", OpenTasks = 1 },
            new Worker { Id = "W-104", FullName = "Aysel Rəhimova", Position = "Abadlıq üzrə mütəxəssis", Department = "Abadlıq şöbəsi", Phone = "+994 50 777 88 99", Email = "aysel.rahimova@nerimanov.gov.az", Zone = "Ziya Bünyadov pr.", Status = "active", Init = "AR", Color = "#A855F7", OpenTasks = 4 },
            new Worker { Id = "W-105", FullName = "Vüqar Səfərov", Position = "Kommunal üzrə mühəndis", Department = "Kommunal təsərrüfat", Phone = "+994 55 888 99 00", Email = "vuqar.safarov@nerimanov.gov.az", Zone = "Koroğlu Rəhimov", Status = "active", Init = "VS", Color = "#0EA5E9", OpenTasks = 2 },
            new Worker { Id = "W-106", FullName = "Günel Məmmədli", Position = "Sanitar nəzarət inspektoru", Department = "Sanitar nəzarət", Phone = "+994 51 999 00 11", Email = "gunel.mammadli@nerimanov.gov.az", Zone = "Əhməd Rəcəbli", Status = "inactive", Init = "GM", Color = "#EC4899", OpenTasks = 0 },
        });
    }

    private void SeedLdap()
    {
        LdapUsers.AddRange(new[]
        {
            new LdapUser { Id = "LDAP-1", Dn = "cn=Leyla Məmmədova,ou=Operativ,dc=nerimanov,dc=gov,dc=az", Cn = "Leyla Məmmədova", Uid = "leyla.m", Email = "leyla.mammadova@nerimanov.gov.az", Ou = "Operativ idarəetmə", Groups = new() { "operators", "staff" }, Enabled = true, LastSync = "30 May, 06:00" },
            new LdapUser { Id = "LDAP-2", Dn = "cn=Rəşad Quliyev,ou=Operativ,dc=nerimanov,dc=gov,dc=az", Cn = "Rəşad Quliyev", Uid = "reshad.q", Email = "reshad.quliyev@nerimanov.gov.az", Ou = "Operativ idarəetmə", Groups = new() { "operators" }, Enabled = true, LastSync = "30 May, 06:00" },
            new LdapUser { Id = "LDAP-3", Dn = "cn=Kamran Nəbiyev,ou=IT,dc=nerimanov,dc=gov,dc=az", Cn = "Kamran Nəbiyev", Uid = "kamran.n", Email = "kamran.nabiyev@nerimanov.gov.az", Ou = "İnformasiya texnologiyaları", Groups = new() { "admins", "it" }, Enabled = true, LastSync = "30 May, 06:00" },
            new LdapUser { Id = "LDAP-4", Dn = "cn=Elçin Hüseynov,ou=Sahe,dc=nerimanov,dc=gov,dc=az", Cn = "Elçin Hüseynov", Uid = "elchin.h", Email = "elchin.huseynov@nerimanov.gov.az", Ou = "Sahə xidməti", Groups = new() { "representatives" }, Enabled = true, LastSync = "30 May, 06:00" },
            new LdapUser { Id = "LDAP-5", Dn = "cn=Köhnə Hesab,ou=Arxiv,dc=nerimanov,dc=gov,dc=az", Cn = "Köhnə Hesab", Uid = "old.acct", Email = "old@nerimanov.gov.az", Ou = "Arxiv", Groups = new() { "disabled" }, Enabled = false, LastSync = "12 Yan, 06:00" },
        });
    }

    private void SeedWorkflow()
    {
        // --- Marşrutlar (oxlarla status axını) ---
        Routes.Add(new Route
        {
            Id = "R-KOM", Name = "Kommunal standart marşrut", Type = "sequential",
            Description = "Su, drenaj və kommunal qəzalar üçün ardıcıl təsdiq axını.",
            Steps = new()
            {
                new() { Id = "n1", Code = "new",        Name = "Yeni",            Type = "start",  Role = "operator",       Color = "#64748B", X = 40,  Y = 140 },
                new() { Id = "n2", Code = "registered", Name = "Qeydiyyat",        Type = "normal", Role = "operator",       Color = "#3B82F6", X = 240, Y = 140 },
                new() { Id = "n3", Code = "assigned",   Name = "İcraçı təyini",    Type = "normal", Role = "operator",       Color = "#8B5CF6", X = 440, Y = 140 },
                new() { Id = "n4", Code = "inprogress", Name = "İcrada (briqada)", Type = "normal", Role = "representative", Color = "#F97316", X = 640, Y = 140 },
                new() { Id = "n5", Code = "resolved",   Name = "Həll edildi",      Type = "end",    Role = "representative", Color = "#10B981", X = 840, Y = 140 },
            },
            Transitions = new()
            {
                new() { Id = "t1", From = "n1", To = "n2", Label = "Qeydiyyat", Kind = "internal" },
                new() { Id = "t2", From = "n2", To = "n3", Label = "Təyin et", Kind = "internal" },
                new() { Id = "t3", From = "n3", To = "n4", Label = "Sahəyə", Kind = "internal" },
                new() { Id = "t4", From = "n4", To = "n5", Label = "Tamamla", Kind = "internal" },
            }
        });
        Routes.Add(new Route
        {
            Id = "R-TIK", Name = "Qanunsuz tikinti marşrutu", Type = "sequential",
            Description = "AI/şikayət mənbəli tikinti pozuntuları — İDDA Gateway ilə xarici quruma göndərmə daxil.",
            Steps = new()
            {
                new() { Id = "n1", Code = "new",        Name = "Yeni / AI siqnal", Type = "start",    Role = "operator",       Color = "#64748B", X = 40,  Y = 60 },
                new() { Id = "n2", Code = "classified", Name = "Təsnifat",          Type = "normal",   Role = "operator",       Color = "#0EA5E9", X = 240, Y = 60 },
                new() { Id = "n3", Code = "onsite",     Name = "Sahə baxışı (AI təsdiq)", Type = "normal", Role = "representative", Color = "#F59E0B", X = 440, Y = 60 },
                new() { Id = "n4", Code = "external",   Name = "Dövlət Şəhərsalma və Arxitektura Komitəsi", Type = "external", Role = "external", Color = "#8B5CF6", X = 440, Y = 220 },
                new() { Id = "n5", Code = "inprogress", Name = "İcra / sökülmə",    Type = "normal",   Role = "representative", Color = "#F97316", X = 680, Y = 60 },
                new() { Id = "n6", Code = "resolved",   Name = "Həll edildi",       Type = "end",      Role = "representative", Color = "#10B981", X = 880, Y = 60 },
            },
            Transitions = new()
            {
                new() { Id = "t1", From = "n1", To = "n2", Label = "Təsnif et", Kind = "internal" },
                new() { Id = "t2", From = "n2", To = "n3", Label = "Sahəyə", Kind = "internal" },
                new() { Id = "t3", From = "n3", To = "n4", Label = "İDDA Gateway → göndər", Kind = "external" },
                new() { Id = "t4", From = "n4", To = "n5", Label = "Qərar gəldi", Kind = "external" },
                new() { Id = "t5", From = "n5", To = "n6", Label = "Tamamla", Kind = "internal" },
            }
        });
        Routes.Add(new Route
        {
            Id = "R-ABAD", Name = "Abadlıq və təmizlik marşrutu", Type = "sequential",
            Description = "Yaşıllıq, səki, zibil və sanitar müraciətləri.",
            Steps = new()
            {
                new() { Id = "n1", Code = "new",        Name = "Yeni",         Type = "start",  Role = "operator",       Color = "#64748B", X = 60,  Y = 140 },
                new() { Id = "n2", Code = "assigned",   Name = "Briqadaya təyin", Type = "normal", Role = "operator",    Color = "#8B5CF6", X = 300, Y = 140 },
                new() { Id = "n3", Code = "inprogress", Name = "İcrada",       Type = "normal", Role = "representative", Color = "#F97316", X = 540, Y = 140 },
                new() { Id = "n4", Code = "resolved",   Name = "Həll edildi",  Type = "end",    Role = "representative", Color = "#10B981", X = 780, Y = 140 },
            },
            Transitions = new()
            {
                new() { Id = "t1", From = "n1", To = "n2", Label = "Təyin et", Kind = "internal" },
                new() { Id = "t2", From = "n2", To = "n3", Label = "Başla", Kind = "internal" },
                new() { Id = "t3", From = "n3", To = "n4", Label = "Tamamla", Kind = "internal" },
            }
        });
        Routes.Add(new Route
        {
            Id = "R-YOL", Name = "Nəqliyyat / yol marşrutu", Type = "parallel",
            Description = "Yol, işıqfor, asfalt — paralel olaraq AYNA və yol xidmətinə bildiriş.",
            Steps = new()
            {
                new() { Id = "n1", Code = "new",        Name = "Yeni",          Type = "start",  Role = "operator",       Color = "#64748B", X = 60,  Y = 140 },
                new() { Id = "n2", Code = "assigned",   Name = "İcraçı təyini", Type = "normal", Role = "operator",       Color = "#8B5CF6", X = 300, Y = 80 },
                new() { Id = "n3", Code = "external",   Name = "AYNA bildiriş", Type = "external", Role = "external",      Color = "#8B5CF6", X = 300, Y = 220 },
                new() { Id = "n4", Code = "inprogress", Name = "Təmir",         Type = "normal", Role = "representative", Color = "#F97316", X = 560, Y = 140 },
                new() { Id = "n5", Code = "resolved",   Name = "Həll edildi",   Type = "end",    Role = "representative", Color = "#10B981", X = 800, Y = 140 },
            },
            Transitions = new()
            {
                new() { Id = "t1", From = "n1", To = "n2", Label = "Təyin", Kind = "internal" },
                new() { Id = "t2", From = "n1", To = "n3", Label = "Paralel bildiriş", Kind = "external" },
                new() { Id = "t3", From = "n2", To = "n4", Label = "İcra", Kind = "internal" },
                new() { Id = "t4", From = "n3", To = "n4", Label = "Razılaşma", Kind = "external" },
                new() { Id = "t5", From = "n4", To = "n5", Label = "Tamamla", Kind = "internal" },
            }
        });

        // --- Nameklatur (hər birinin BİR marşrutu) ---
        Nomenclatures.AddRange(new[]
        {
            new Nomenclature { Id = "NC-01", Code = "KOM-SU",  Name = "Kommunal / Su təchizatı",        Group = "Kommunal",   DefaultPriority = "urgent", SlaHours = 12, RouteId = "R-KOM",  Description = "Su xətti, magistral boru qəzaları." },
            new Nomenclature { Id = "NC-02", Code = "KOM-DRN", Name = "Kommunal / Drenaj",              Group = "Kommunal",   DefaultPriority = "high",   SlaHours = 24, RouteId = "R-KOM",  Description = "Yağış suyu, drenaj təmizliyi." },
            new Nomenclature { Id = "NC-03", Code = "SEH-TIK", Name = "Şəhərsalma / Qanunsuz tikinti",  Group = "Şəhərsalma", DefaultPriority = "high",   SlaHours = 72, RouteId = "R-TIK",  Description = "İcazəsiz tikinti, artırma." },
            new Nomenclature { Id = "NC-04", Code = "SEH-REK", Name = "Şəhərsalma / Reklam",            Group = "Şəhərsalma", DefaultPriority = "low",    SlaHours = 96, RouteId = "R-TIK",  Description = "Lisenziyasız reklam konstruksiyaları." },
            new Nomenclature { Id = "NC-05", Code = "ABD-YAS", Name = "Abadlıq / Yaşıllıq",             Group = "Abadlıq",    DefaultPriority = "high",   SlaHours = 24, RouteId = "R-ABAD", Description = "Ağac, yaşıllıq, park." },
            new Nomenclature { Id = "NC-06", Code = "ABD-INF", Name = "Abadlıq / İnfrastruktur",        Group = "Abadlıq",    DefaultPriority = "normal", SlaHours = 48, RouteId = "R-ABAD", Description = "Səki, plitə, infrastruktur." },
            new Nomenclature { Id = "NC-07", Code = "TMZ-TUL", Name = "Təmizlik / Tullantı",            Group = "Təmizlik",   DefaultPriority = "normal", SlaHours = 24, RouteId = "R-ABAD", Description = "Zibil, konteyner, tullantı." },
            new Nomenclature { Id = "NC-08", Code = "SAN-HEY", Name = "Sanitar / Heyvanlar",            Group = "Sanitar",    DefaultPriority = "normal", SlaHours = 48, RouteId = "R-ABAD", Description = "Sahibsiz heyvan klasterləri." },
            new Nomenclature { Id = "NC-09", Code = "NEQ-YOL", Name = "Nəqliyyat / Yol infrastrukturu", Group = "Nəqliyyat",  DefaultPriority = "high",   SlaHours = 36, RouteId = "R-YOL",  Description = "Asfalt, işıqfor, yol nişanı." },
        });
    }

    private void SeedPrivileges()
    {
        Roles.AddRange(new[]
        {
            new Role { Id = "operator",       Name = "RİH operatoru",    Description = "Müraciətləri qəbul, təsnif və təyin edir.", UserCount = 2 },
            new Role { Id = "representative", Name = "RİH nümayəndəsi",  Description = "Sahə işləri, marşrut icrası.",              UserCount = 3 },
            new Role { Id = "admin",          Name = "Administrator",    Description = "Tam sistem idarəetməsi.",                   UserCount = 1 },
        });

        (string res, string label)[] resources =
        {
            ("incidents", "Müraciətlər"), ("routes", "Marşrutlar"), ("nomenclatures", "Nameklatur"),
            ("users", "İstifadəçilər"), ("workers", "İşçilər"), ("ldap", "LDAP"),
            ("conversations", "Yazışmalar"), ("idda", "İDDA Gateway"), ("layers", "Xəritə təbəqələri"),
        };
        foreach (var (res, label) in resources)
        {
            // admin — hər şey
            Permissions.Add(new RolePermission { RoleId = "admin", Resource = res, ResourceLabel = label, View = true, Create = true, Edit = true, Delete = true });
            // operator — əməliyyat resursları
            bool opFull = res is "incidents" or "conversations" or "idda" or "layers";
            Permissions.Add(new RolePermission { RoleId = "operator", Resource = res, ResourceLabel = label, View = true, Create = opFull, Edit = opFull, Delete = res == "incidents" });
            // representative — əsasən baxış + müraciət yeniləmə
            bool repEdit = res is "incidents" or "conversations";
            Permissions.Add(new RolePermission { RoleId = "representative", Resource = res, ResourceLabel = label, View = res is "incidents" or "routes" or "conversations" or "layers", Create = false, Edit = repEdit, Delete = false });
        }
    }

    private void SeedIdda()
    {
        Organizations.AddRange(new[]
        {
            new Organization { Id = "ORG-1", Name = "Dövlət Şəhərsalma və Arxitektura Komitəsi", Parent = "Dövlət qurumları", Type = "dovlet" },
            new Organization { Id = "ORG-2", Name = "«Azərsu» ASC", Parent = "Kommunal", Type = "dovlet" },
            new Organization { Id = "ORG-3", Name = "«Azəriqaz» İB", Parent = "Kommunal", Type = "dovlet" },
            new Organization { Id = "ORG-4", Name = "Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA)", Parent = "Nəqliyyat", Type = "dovlet" },
            new Organization { Id = "ORG-5", Name = "Bakı Nəqliyyat Agentliyi (AYNA)", Parent = "Nəqliyyat", Type = "dovlet" },
            new Organization { Id = "ORG-6", Name = "«Təmiz Şəhər» ASC", Parent = "Təmizlik", Type = "dovlet" },
            new Organization { Id = "ORG-7", Name = "«Azərişıq» ASC", Parent = "Energetika", Type = "dovlet" },
        });

        IddaDocuments.Add(new IddaDocument
        {
            Id = "IDDA-5012", Subject = "İcazəsiz tikinti barədə sorğu — Fətəli Xan Xoyski 145",
            Content = "Nərimanov RİH tərəfindən aşkarlanan qanunsuz tikinti faktı barədə araşdırma və müvafiq tədbirlərin görülməsi xahiş olunur.",
            RecipientOrg = "Dövlət Şəhərsalma və Arxitektura Komitəsi", Sender = "Leyla Məmmədova", SignatureType = "SIMA",
            Status = "IN_PROGRESS", CreatedAt = "30 May, 09:35", IncidentId = "NRM-24816",
            Timeline = new()
            {
                new() { Status = "SENT",            T = "30 May 09:35", Actor = "Leyla Məmmədova", Note = "Sənəd SIMA ilə imzalanıb göndərildi." },
                new() { Status = "RECEIVED",        T = "30 May 09:38", Actor = "İDDA Gateway",    Note = "Qəbul edən qurum tərəfindən alındı." },
                new() { Status = "IN_GENERAL_DEPT", T = "30 May 10:05", Actor = "Ümumi şöbə",      Note = "Ümumi şöbədə qeydiyyata alındı." },
                new() { Status = "ASSIGNED",        T = "30 May 11:20", Actor = "Şəhərsalma Komitəsi", Note = "Aidiyyəti üzrə şöbəyə təyin edildi." },
                new() { Status = "IN_PROGRESS",     T = "30 May 13:00", Actor = "İcraçı",          Note = "Araşdırma başladı." },
            }
        });
        IddaDocuments.Add(new IddaDocument
        {
            Id = "IDDA-5008", Subject = "Magistral boru qəzası — «Azərsu» müdaxiləsi",
            Content = "Atatürk pr. 24 ünvanında magistral su xəttində qəza. Təcili briqada cəlb edilməsi xahiş olunur.",
            RecipientOrg = "«Azərsu» ASC", Sender = "Leyla Məmmədova", SignatureType = "ASAN",
            Status = "RESOLVED", CreatedAt = "30 May, 08:30", IncidentId = "NRM-24817",
            Timeline = new()
            {
                new() { Status = "SENT",        T = "30 May 08:30", Actor = "Leyla Məmmədova", Note = "ASAN İmza ilə göndərildi." },
                new() { Status = "RECEIVED",    T = "30 May 08:33", Actor = "«Azərsu» ASC",    Note = "Qəbul edildi." },
                new() { Status = "ASSIGNED",    T = "30 May 08:50", Actor = "Növbətçi briqada", Note = "Briqada təyin edildi." },
                new() { Status = "IN_PROGRESS", T = "30 May 09:40", Actor = "Briqada",          Note = "Sahədə təmir başladı." },
                new() { Status = "RESOLVED",    T = "30 May 12:10", Actor = "Briqada",          Note = "Qəza aradan qaldırıldı." },
            }
        });
        IddaDocuments.Add(new IddaDocument
        {
            Id = "IDDA-4995", Subject = "İşıqfor nasazlığı — Koroğlu Rəhimov 8",
            Content = "Keçiddə işıqfor sıradan çıxıb. AYNA-dan müvafiq müdaxilə xahiş olunur.",
            RecipientOrg = "Bakı Nəqliyyat Agentliyi (AYNA)", Sender = "Rəşad Quliyev", SignatureType = "SIMA",
            Status = "SENT", CreatedAt = "30 May, 10:10", IncidentId = "NRM-24814",
            Timeline = new()
            {
                new() { Status = "SENT", T = "30 May 10:10", Actor = "Rəşad Quliyev", Note = "SIMA ilə göndərildi, cavab gözlənilir." },
            }
        });

        // (b) Müraciətə cavab olaraq əlaqəli şəxsə (vətəndaşa) göndərilən sənədlər
        IddaDocuments.Add(new IddaDocument
        {
            Id = "IDDA-5021", Subject = "Müraciətə cavab — su sızması aradan qaldırıldı",
            Content = "Hörmətli Anar Səfərov, NRM-24817 saylı müraciətiniz üzrə Atatürk pr. 24 ünvanında su sızması briqada tərəfindən aradan qaldırılmışdır. Diqqətiniz üçün təşəkkür edirik.",
            RecipientOrg = "Anar Səfərov", RecipientType = "person", Sender = "Leyla Məmmədova", SignatureType = "SIMA",
            Status = "RECEIVED", CreatedAt = "30 May, 12:40", IncidentId = "NRM-24817",
            Timeline = new()
            {
                new() { Status = "SENT",     T = "30 May 12:40", Actor = "Leyla Məmmədova", Note = "Cavab sənədi SIMA ilə imzalanıb vətəndaşa göndərildi." },
                new() { Status = "RECEIVED", T = "30 May 13:05", Actor = "Anar Səfərov",    Note = "Vətəndaş sənədi qəbul etdi." },
            }
        });
        IddaDocuments.Add(new IddaDocument
        {
            Id = "IDDA-5018", Subject = "Müraciətə cavab — qanunsuz tikinti araşdırılır",
            Content = "Hörmətli Səbinə Rəhimli, müraciətiniz üzrə Fətəli Xan Xoyski 145 ünvanında aşkarlanan tikinti faktı Dövlət Şəhərsalma və Arxitektura Komitəsinə yönləndirilmiş, araşdırma davam edir. Nəticə barədə əlavə məlumatlandırılacaqsınız.",
            RecipientOrg = "Səbinə Rəhimli", RecipientType = "person", Sender = "Leyla Məmmədova", SignatureType = "ASAN",
            Status = "SENT", CreatedAt = "30 May, 11:15", IncidentId = "NRM-24816",
            Timeline = new()
            {
                new() { Status = "SENT", T = "30 May 11:15", Actor = "Leyla Məmmədova", Note = "Cavab sənədi ASAN İmza ilə vətəndaşa göndərildi." },
            }
        });
    }

    private void SeedConversations()
    {
        Conversations.Add(new Conversation
        {
            Id = "CNV-301", Subject = "Su sızması — əlavə məlumat", Constituent = "Anar Səfərov", ConstituentInit = "AS",
            AssigneeId = "rep1", Channel = "inapp", Status = "needsReply", Updated = "09:48", IncidentId = "NRM-24817",
            Messages = new()
            {
                new() { Id = "m1", Sender = "citizen", Text = "Salam, su hələ də axır, vəziyyət pisləşir.", T = "09:30", Channel = "inapp" },
                new() { Id = "m2", Sender = "rih", Text = "Salam, briqada yoldadır, 20 dəqiqəyə çatacaq.", T = "09:35", Channel = "inapp" },
                new() { Id = "m3", Sender = "citizen", Text = "Təşəkkür, gözləyirik.", T = "09:48", Channel = "inapp" },
            }
        });
        Conversations.Add(new Conversation
        {
            Id = "CNV-302", Subject = "Ağac aşması — keçid bağlıdır", Constituent = "Səbinə Rəhimli", ConstituentInit = "SR",
            AssigneeId = "rep3", Channel = "sms", Status = "new", Updated = "09:26", IncidentId = "NRM-24815",
            Messages = new()
            {
                new() { Id = "m1", Sender = "citizen", Text = "Ağac səkiyə yıxılıb, uşaqlar məktəbə keçə bilmir.", T = "09:25", Channel = "sms" },
            }
        });
        Conversations.Add(new Conversation
        {
            Id = "CNV-303", Subject = "Zibil yığını həll olundu?", Constituent = "Kamran Vəliyev", ConstituentInit = "KV",
            AssigneeId = "rep1", Channel = "push", Status = "waiting", Updated = "Dünən", IncidentId = "NRM-24813",
            Messages = new()
            {
                new() { Id = "m1", Sender = "rih", Text = "Ərazi təmizləndi, təsdiq edirsinizmi?", T = "09:20", Channel = "push" },
                new() { Id = "m2", Sender = "citizen", Text = "Bəli, təşəkkür edirəm!", T = "09:25", Channel = "push" },
            }
        });
    }

    private void SeedMobile()
    {
        NearbyProblems.AddRange(new[]
        {
            new NearbyProblem { Id = "NRM-24817", Title = "Su sızması", Icon = "droplet", Color = "#EF4444", DistanceM = 120, Addr = "Atatürk pr.", Lng = 49.8472, Lat = 40.4121 },
            new NearbyProblem { Id = "NRM-24815", Title = "Yıxılmış ağac", Icon = "triangle-alert", Color = "#F59E0B", DistanceM = 340, Addr = "Ziya Bünyadov", Lng = 49.864, Lat = 40.404 },
            new NearbyProblem { Id = "NRM-24813", Title = "Zibil yığını", Icon = "trash-2", Color = "#3B82F6", DistanceM = 500, Addr = "Zərdabi küç.", Lng = 49.8489, Lat = 40.4051 },
        });
        Contacts.AddRange(new[]
        {
            new Contact { Number = "104", Name = "Qaz xidməti", Icon = "flame" },
            new Contact { Number = "109", Name = "Su xidməti (Azərsu)", Icon = "droplet" },
            new Contact { Number = "955", Name = "İşıq xidməti (Azərişıq)", Icon = "zap" },
            new Contact { Number = "112", Name = "Fövqəladə hallar", Icon = "siren" },
            new Contact { Number = "102", Name = "Polis", Icon = "shield" },
            new Contact { Number = "103", Name = "Təcili tibbi yardım", Icon = "cross" },
        });
    }
}
