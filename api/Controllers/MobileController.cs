using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Mobile ana səhifə + profil köməkçi məlumatları.</summary>
[ApiController]
[Route("api/mobile")]
public class MobileController : ControllerBase
{
    private readonly MockDataStore _db;
    public MobileController(MockDataStore db) => _db = db;

    /// <summary>Yaxınlıqdakı problemlər (ana səhifə + Waze-tipli trigger).</summary>
    [HttpGet("nearby")]
    public IEnumerable<NearbyProblem> Nearby() => _db.NearbyProblems;

    /// <summary>Faydalı kontaktlar (profil → birbaşa zəng).</summary>
    [HttpGet("contacts")]
    public IEnumerable<Contact> Contacts() => _db.Contacts;
}
