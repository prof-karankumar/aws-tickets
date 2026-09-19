export interface ParsedEmailOrder {
  id: string;
  eventName: string;
  eventUrl: string;
  ticketmasterUrl: string;
  eventDateTime: string;
  exchange: 'StubHub' | 'SeatGeek' | 'Vivid Seats';
  quantity: number;
  totalPrice: string;
  timeReceived: string;
}

export function parseEmailOrder(subject: string, bodyText: string): ParsedEmailOrder {
  const content = `${subject} ${bodyText}`;

  // Detect Exchange
  let exchange: 'StubHub' | 'SeatGeek' | 'Vivid Seats' = 'StubHub';
  if (/seatgeek/i.test(content)) {
    exchange = 'SeatGeek';
  } else if (/vivid\s*seats/i.test(content)) {
    exchange = 'Vivid Seats';
  } else if (/stubhub/i.test(content)) {
    exchange = 'StubHub';
  }

  // Detect Event Name
  let eventName = 'Unknown Event';
  const eventMatch =
    content.match(/event:\s*([^\n\r<]+)/i) ||
    content.match(/for\s+([A-Z0-9\s|:\-]+(?:Tour|Concert|Game|Show|Live))/i) ||
    content.match(/order:\s*([^\n\r<]+)/i);

  if (eventMatch && eventMatch[1]) {
    eventName = eventMatch[1].trim();
  } else if (subject) {
    eventName = subject.replace(/You got order|\bOrder\b|Confirmation/gi, '').trim() || 'New Ticket Order';
  }

  // Detect Event URL
  let eventUrl = 'https://stubhub.com';
  const urlMatch = content.match(/https?:\/\/[^\s"<>\)]+/i);
  if (urlMatch) {
    eventUrl = urlMatch[0];
  } else if (exchange === 'SeatGeek') {
    eventUrl = 'https://seatgeek.com';
  } else if (exchange === 'Vivid Seats') {
    eventUrl = 'https://vividseats.com';
  }

  // Detect Event Date/Time
  let eventDateTime = 'Date TBA';
  const dateMatch = content.match(
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}(?:\s*[·,-]?\s*\d{1,2}:\d{2}\s*(?:AM|PM)?)?)/i
  );
  if (dateMatch && dateMatch[1]) {
    eventDateTime = dateMatch[1].trim();
  }

  // Build a Ticketmaster search link from the event name (real link isn't in the email)
  const ticketmasterUrl = `https://www.ticketmaster.com/search?q=${encodeURIComponent(eventName)}`;

  // Detect Quantity
  let quantity = 2;
  const qtyMatch = content.match(/(\d+)\s*(?:x|qty|tickets|seats|ticket)/i);
  if (qtyMatch && qtyMatch[1]) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // Detect Price
  let totalPrice = '$350.00';
  const priceMatch = content.match(/\$\d+(?:\.\d{2})?/);
  if (priceMatch) {
    totalPrice = priceMatch[0].includes('.') ? priceMatch[0] : `${priceMatch[0]}.00`;
  }

  return {
    id: `email-ord-${Date.now().toString().slice(-5)}`,
    eventName,
    eventUrl,
    ticketmasterUrl,
    eventDateTime,
    exchange,
    quantity,
    totalPrice,
    timeReceived: 'Just now (via Email)',
  };
}
