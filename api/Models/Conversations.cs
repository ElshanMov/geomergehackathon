namespace NerimanovOps.Api.Models;

/// <summary>Vətəndaş ↔ RİH nümayəndəsi yazışması (Konversasiyalar inbox).</summary>
public class Conversation
{
    public string Id { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Constituent { get; set; } = "";  // vətəndaş adı
    public string ConstituentInit { get; set; } = "";
    public string? AssigneeId { get; set; }
    public string Channel { get; set; } = "inapp";  // sms | push | inapp
    public string Status { get; set; } = "new";      // new | needsReply | waiting
    public string Updated { get; set; } = "";
    public string? IncidentId { get; set; }
    public List<Message> Messages { get; set; } = new();

    public int MessageCount => Messages.Count;
}

/// <summary>Yazışmadakı tək mesaj.</summary>
public class Message
{
    public string Id { get; set; } = "";
    public string Sender { get; set; } = "citizen"; // citizen | rih
    public string Text { get; set; } = "";
    public string T { get; set; } = "";
    public string Channel { get; set; } = "inapp";
}

public class SendMessageRequest
{
    public string Text { get; set; } = "";
    public string Sender { get; set; } = "rih";
    public string Channel { get; set; } = "inapp";
}
