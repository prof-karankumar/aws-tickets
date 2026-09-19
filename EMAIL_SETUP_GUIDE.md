# 📧 Email Integration Setup Guide for TicketPortal

Connect your real email address so whenever an email with subject **"You got order"** arrives in your inbox, it is automatically parsed and pops up on your **TicketPortal** screen!

---

## ⚡ Method 1: Google Apps Script (100% Free, 1-Minute Setup for Gmail / Google Workspace)

This is the easiest and fastest way to connect any Gmail / Google Workspace email address without installing anything.

### Step-by-Step Instructions:

1. Open **[Google Apps Script](https://script.google.com/)** and click **New Project**.
2. Replace the code in the editor with the following script:

```javascript
function checkIncomingOrderEmails() {
  // Replace this URL with your deployed website URL (e.g., https://your-app.vercel.app/api/email-webhook)
  // For local testing via ngrok: https://xxxx.ngrok-free.app/api/email-webhook
  var WEBHOOK_URL = "http://localhost:3000/api/email-webhook"; 

  // Search for unread "You got order" emails
  var threads = GmailApp.search("is:unread subject:\"You got order\"");

  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var msg = messages[j];
      if (msg.isUnread()) {
        var payload = {
          subject: msg.getSubject(),
          bodyText: msg.getPlainBody(),
          sender: msg.getFrom(),
          timeReceived: msg.getDate().toISOString()
        };

        var options = {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload)
        };

        try {
          UrlFetchApp.fetch(WEBHOOK_URL, options);
          msg.markRead(); // Mark as read so it doesn't send twice
        } catch (e) {
          Logger.log("Error sending webhook: " + e.toString());
        }
      }
    }
  }
}
```

3. Click **Save** 💾.
4. Click **Triggers** (Alarm Clock Icon on the left sidebar) -> **Add Trigger**:
   - **Function to run**: `checkIncomingOrderEmails`
   - **Select event source**: `Time-driven`
   - **Type of time based trigger**: `Every minute`
5. Click **Save**. Done! 🎉

---

## ⚡ Method 2: SendGrid / Mailgun / Postmark Inbound Parse Webhook

If you receive emails on your own custom domain (e.g. `orders@yourdomain.com`):

1. Go to **SendGrid** -> **Settings** -> **Inbound Parse**.
2. Add your domain (e.g. `yourdomain.com`).
3. Set Destination URL to:
   ```
   https://your-domain.com/api/email-webhook
   ```
4. Every email received by SendGrid will automatically POST to your TicketPortal app!

---

## ⚡ Method 3: Zapier / Make.com Webhook

1. Create a Zap / Scenario with trigger: **New Email in Gmail** (Query: `subject:"You got order"`).
2. Action: **Webhooks by Zapier** -> **POST**.
3. URL: `https://your-domain.com/api/email-webhook`
4. Body Data:
   - `subject`: Email Subject
   - `bodyText`: Email Body Plain Text

---

## 🧪 Testing Your Webhook API

You can test your API route anytime by running this curl command in your terminal:

```bash
curl -X POST http://localhost:3000/api/email-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "You got order! Taylor Swift The Eras Tour",
    "bodyText": "Congratulations! Order received on StubHub.\nEvent: Taylor Swift | The Eras Tour 2026\nTickets: 2 Qty\nTotal: $550.00\nURL: https://stubhub.com/taylor-swift-eras-tour"
  }'
```

The app will parse the email text and launch the **NEW ORDER RECEIVED!** popup modal with StubHub / SeatGeek / Vivid Seats logo and animated **ACCEPT** (Green) / **REJECT** (Red) buttons!
