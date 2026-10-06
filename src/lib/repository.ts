import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-side Supabase client with admin privileges
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

export const repository = {
  async listProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error listing products:', error.message);
      return [];
    }
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      priceXaf: Number(p.price_xaf),
      stock: p.stock,
      category: p.category
    }));
  },

  async updateProductPrice(id: string, priceXaf: number) {
    const { error } = await supabase
      .from('products')
      .update({ price_xaf: priceXaf })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async updateProductStock(id: string, stock: number) {
    const { error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async listOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing orders:', error.message);
      return [];
    }

    return data.map((o: any) => ({
      id: o.id,
      reference: o.reference,
      customerName: o.customer_name,
      hospitalName: o.hospital_name,
      status: o.status,
      totalXaf: Number(o.total_xaf),
      createdAt: o.created_at, // Preserves your custom backdated date
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
      paymentRef: o.payment_ref
    }));
  },

  async createOrder(order: {
    id: string;
    reference: string;
    customerName: string;
    hospitalName: string;
    status: string;
    totalXaf: number;
    createdAt: string; // Accepts your custom backdated date string
    items: string | any[];
    paymentRef: string;
  }) {
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      reference: order.reference,
      customer_name: order.customerName,
      hospital_name: order.hospitalName,
      status: order.status,
      total_xaf: order.totalXaf,
      created_at: order.createdAt, // Explicitly saves your backdated date
      items: order.items,
      payment_ref: order.paymentRef
    });

    if (error) {
      console.error('Error creating order:', error.message);
      throw new Error(error.message);
    }
  }
};