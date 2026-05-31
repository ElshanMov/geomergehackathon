using Microsoft.AspNetCore.Mvc;
using NerimanovOps.Api.Data;
using NerimanovOps.Api.Models;

namespace NerimanovOps.Api.Controllers;

/// <summary>Vətəndaş ↔ RİH yazışmaları (Konversasiyalar inbox).</summary>
[ApiController]
[Route("api/conversations")]
public class ConversationsController : ControllerBase
{
    private readonly MockDataStore _db;
    public ConversationsController(MockDataStore db) => _db = db;

    [HttpGet]
    public IEnumerable<Conversation> List([FromQuery] string? status, [FromQuery] string? assigneeId)
    {
        IEnumerable<Conversation> items = _db.Conversations;
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(c => c.Status == status);
        if (!string.IsNullOrWhiteSpace(assigneeId)) items = items.Where(c => c.AssigneeId == assigneeId);
        return items.ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<Conversation> Get(string id)
    {
        var c = _db.Conversations.FirstOrDefault(x => x.Id == id);
        return c is null ? NotFound() : c;
    }

    /// <summary>Yazışmaya mesaj əlavə et (RİH cavabı və ya vətəndaş mesajı).</summary>
    [HttpPost("{id}/messages")]
    public ActionResult<Conversation> Send(string id, SendMessageRequest req)
    {
        var c = _db.Conversations.FirstOrDefault(x => x.Id == id);
        if (c is null) return NotFound();
        c.Messages.Add(new Message
        {
            Id = "m" + (c.Messages.Count + 1),
            Sender = req.Sender,
            Text = req.Text,
            T = DateTime.Now.ToString("HH:mm"),
            Channel = req.Channel
        });
        c.Updated = DateTime.Now.ToString("HH:mm");
        c.Status = req.Sender == "rih" ? "waiting" : "needsReply";
        return c;
    }
}
