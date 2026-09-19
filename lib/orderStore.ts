import type { OrderRecord } from '@/lib/types';

const STORAGE_KEY = 'ticketportal-orders-v2';
const ORDERS_UPDATED_EVENT = 'ticketportal-orders-updated';

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord-101',
    eventName: 'Taylor Swift | The Eras Tour',
    eventUrl: 'https://stubhub.com/taylor-swift-tickets',
    ticketmasterUrl: 'https://ticketmaster.com/taylor-swift-eras-tour',
    eventDateTime: 'Mar 14, 2026 · 7:30 PM',
    exchange: 'StubHub',
    quantity: 2,
    totalPrice: '$450.00',
    timeReceived: '2 mins ago',
    status: 'Pending',
  },
  {
    id: 'ord-102',
    eventName: 'Coldplay — Music of the Spheres',
    eventUrl: 'https://seatgeek.com/coldplay-tickets',
    ticketmasterUrl: 'https://ticketmaster.com/coldplay-tour',
    eventDateTime: 'Apr 02, 2026 · 8:00 PM',
    exchange: 'SeatGeek',
    quantity: 4,
    totalPrice: '$980.00',
    timeReceived: '12 mins ago',
    status: 'Pending',
  },
  {
    id: 'ord-103',
    eventName: 'Lakers vs Warriors',
    eventUrl: 'https://vividseats.com/drake-tickets',
    ticketmasterUrl: 'https://ticketmaster.com/lakers-warriors',
    eventDateTime: 'Feb 20, 2026 · 7:00 PM',
    exchange: 'Vivid Seats',
    quantity: 2,
    totalPrice: '$310.00',
    timeReceived: '41 mins ago',
    status: 'Pending',
  },
];

export function getOrders(): OrderRecord[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(stored) as OrderRecord[];
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: OrderRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
}

export function addOrder(order: OrderItemLike) {
  saveOrders([order, ...getOrders()]);
}

export function updateOrderStatus(id: string, status: OrderRecord['status']) {
  saveOrders(getOrders().map((order) => (order.id === id ? { ...order, status } : order)));
}

export const ORDER_UPDATED_EVENT = ORDERS_UPDATED_EVENT;
type OrderItemLike = OrderRecord;
