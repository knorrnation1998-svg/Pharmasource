import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const orderId = body.id || `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await repository.createOrder({
      id: orderId,
      reference: body.reference,
      customerName: body.customerName,
      hospitalName: body.hospitalName,
      status: body.status || 'completed',
      totalXaf: Number(body.totalXaf),
      createdAt: body.createdAt || new Date().toISOString(), // Handles backdating seamlessly
      items: body.items,
      paymentRef: body.paymentRef || 'MANUAL_BACKDATE'
    });

    return NextResponse.json({ success: true, id: orderId });
  } catch (error: any) {
    console.error('API Order Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}