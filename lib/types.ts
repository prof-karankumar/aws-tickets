export interface OrderItem {
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

export interface OrderRecord extends OrderItem {
  status: 'Pending' | 'Accepted' | 'Rejected';
}
