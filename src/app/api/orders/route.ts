import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newOrder = {
      id: `ord-${Date.now()}`,
      reference: body.reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: body.customerName,
      hospitalName: body.hospitalName,
      status: body.status || 'completed',
      totalXaf: body.totalXaf,
      // This ensures your backdated timestamp is saved permanently to Turso
      createdAt: body.createdAt || new Date().toISOString(),
      items: body.items,
      paymentRef: body.paymentRef || 'MANUAL_BACKDATE'
    };

    const savedOrder = await repository.createOrder(newOrder);
    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await repository.listOrders();
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}