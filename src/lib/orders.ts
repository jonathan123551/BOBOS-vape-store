import { isSupabaseConfigured, supabase } from "./supabase";
import type { CartItem } from "@/contexts/CartContext";

export interface OrderInput {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
}

export interface OrderResult {
  id: string;
  total: number;
  status: "PENDING";
}

interface OrderRow {
  id: string;
  total: number;
  status: string;
}

/**
 * Create an order. When Supabase is configured the order + line items are
 * inserted via the anon key (RLS allows insert into `orders` and
 * `order_items` for the public role). When Supabase is NOT configured, the
 * order is fabricated locally so the checkout flow still completes on the
 * Lovable preview / offline demo.
 */
export async function createOrder(input: OrderInput): Promise<OrderResult> {
  const total = input.items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (isSupabaseConfigured && supabase) {
    const { data, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_name: input.customerName,
        phone: input.phone,
        address: input.address,
        notes: input.notes ?? null,
        total,
        status: "PENDING",
      })
      .select("id, total, status")
      .single();
    const order = data as unknown as OrderRow | null;
    if (orderErr || !order) {
      throw orderErr ?? new Error("Failed to create order");
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      input.items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    );
    if (itemsErr) throw itemsErr;

    return { id: order.id, total: order.total, status: "PENDING" };
  }

  // Offline / preview fallback — generate a believable id.
  return {
    id: `demo-${Date.now().toString(36)}`,
    total,
    status: "PENDING",
  };
}
