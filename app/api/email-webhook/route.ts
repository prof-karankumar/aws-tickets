import { NextResponse } from 'next/server';
import { parseEmailOrder } from '@/lib/emailParser';

// In-memory array for demo / webhook API state
let latestParsedOrders: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject = '', bodyText = '', email = '' } = body;

    const parsedOrder = parseEmailOrder(subject || 'You got order!', bodyText || '');
    latestParsedOrders.unshift(parsedOrder);

    return NextResponse.json({
      success: true,
      message: 'Email order parsed successfully',
      order: parsedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to parse email' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    orders: latestParsedOrders,
  });
}
