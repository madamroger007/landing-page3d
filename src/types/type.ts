export type Orders = {
  createdAt: string,
  items: Item[],
  order_id: string,
  status: string,
  gross_amount: number,
  snap_token?: string,
  customer: Customer,
  payment_method?: string,
  payment_name?: string,
  payment_va?: string,
  va_number?: string,
  va_numbers?: Array<{ bank: string; va_number: string }>,
  biller_code?: string,
  bill_key?: string,
  payment_code?: string,
  transaction_id?: string,
  bank?: string,
  masked_card?: string,
  card_type?: string,
  store?: string,
  redirect_url?: string,
  qris_url?: string,
  deeplink_url?: string,
  raw_snap_result?: unknown
}

export type Customer = {
  name: string,
  email: string,
  phone: string
}
export type Item = {
  id: number,
  name: string,
  image?: string,
  videoUrl?: string,
  price: number,
  quantity: number,
  category?: string
}

// ─── Product ─────────────────────────────────────────────────────────────────
export type ProductCategory = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductTool = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}


export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
  videoUrl: string | null;
  category: string | null;
  tools?: ProductTool[];
  toolIds?: number[];
  likes: number | null;
  createdAt: string;
}
// ─── Cart ────────────────────────────────────────────────────────────────────
export type CartItem = Product & {
  quantity: number;
};

// ─── Checkout ────────────────────────────────────────────────────────────────
export type CheckoutStatus = "idle" | "loading" | "success" | "error";

export type MidtransTransaction = {
  order_id: string;
  gross_amount: number;
  items: Item[];
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  payment_method?: string;
  card_token_id?: string;
};

// ─── State ───────────────────────────────────────────────────────────────────
export type ProductState = Omit<CartState, 'cart'> & {
  products: Product[];
  categories: ProductCategory[];
  tools: ProductTool[];
};

// ─── State ───────────────────────────────────────────────────────────────────
export type CartState = {
  cart: CartItem[];
  checkoutStatus: CheckoutStatus;
  loading: boolean;
  error: string | null;
};
// ─── Actions ─────────────────────────────────────────────────────────────────
export type ProductAction =
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "DELETE_PRODUCT"; payload: number }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CATEGORIES"; payload: ProductCategory[] }
  | { type: "UPDATE_CATEGORY"; payload: ProductCategory }
  | { type: "DELETE_CATEGORY"; payload: number }
  | { type: "ADD_CATEGORY"; payload: ProductCategory }
  | { type: "SET_TOOLS"; payload: ProductTool[] }
  | { type: "UPDATE_TOOL"; payload: ProductTool }
  | { type: "DELETE_TOOL"; payload: number }
  | { type: "ADD_TOOL"; payload: ProductTool }

  ;

export type CartAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: number } // product id
  | { type: "DELETE_FROM_CART"; payload: number } // product id
  | { type: "CLEAR_CART" }
  | { type: "SET_CHECKOUT_STATUS"; payload: CheckoutStatus }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  ;


// ── Sort ──────────────────────────────────────────────────────────────────────
export type SortKey =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "oldest";

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Name A → Z", value: "name_asc" },
  { label: "Name Z → A", value: "name_desc" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

export function sortProducts(products: Product[], key: SortKey): Product[] {
  return [...products].sort((a, b) => {
    switch (key) {
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return 0;
    }
  });
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Voucher {
  id: number | undefined;
  code: string;
  discount: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Midtrans Transaction Status ─────────────────────────────────────────────
export type MidtransTransactionStatus =
  | 'capture'      // Card payment accepted
  | 'settlement'   // Payment completed
  | 'pending'      // Waiting for payment
  | 'deny'         // Payment denied
  | 'cancel'       // Canceled by merchant/user
  | 'expire'       // Payment expired
  | 'failure'      // Payment failed
  | 'refund'       // Refunded
  | 'partial_refund' // Partially refunded
  | 'authorize';   // Pre-authorized

export type MidtransFraudStatus = 'accept' | 'challenge' | 'deny';

export interface MidtransTransactionResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: MidtransTransactionStatus;
  fraud_status?: MidtransFraudStatus;
  signature_key?: string;
  bank?: string;
  va_numbers?: Array<{ bank: string; va_number: string }>;
  biller_code?: string;
  bill_key?: string;
  acquirer?: string;
  masked_card?: string;
  card_type?: string;
  approval_code?: string;
  channel_response_code?: string;
  channel_response_message?: string;
  currency?: string;
  settlement_time?: string;
  expiry_time?: string;
}

export type CategoryFilter = "All" | ProductCategory;

export interface Order {
  id: number;
  orderId: string;
  grossAmount: number;
  snapToken: string | null;
  paymentType: string | null;
  paymentName: string | null;
  paymentVa: string | null;
  transactionStatus: string | null;
  transactionId: string | null;
  fraudStatus: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  items: Item[];
  createdAt: string;
  updatedAt: string;
  transactionTime: string | null;
  settlementTime: string | null;
}