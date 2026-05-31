using NerimanovOps.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Controllers + JSON (default camelCase — frontend-lər bunu gözləyir).
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new() { Title = "NərimanovOps API", Version = "v1", Description = "Rəqəmsal Nərimanov — mock data API (SQL yoxdur)." });
});

// Bütün mock datanın tək mənbəyi — in-memory singleton.
builder.Services.AddSingleton<MockDataStore>();

// CORS — web (Cockpit), admin və mobile (Expo) üçün açıq (demo).
builder.Services.AddCors(o => o.AddPolicy("demo", p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// Swagger həmişə açıq (juri yoxlaması üçün).
app.UseSwagger();
app.UseSwaggerUI(o =>
{
    o.SwaggerEndpoint("/swagger/v1/swagger.json", "NərimanovOps API v1");
    o.DocumentTitle = "NərimanovOps API";
});

app.UseCors("demo");
app.MapControllers();

app.Run();
