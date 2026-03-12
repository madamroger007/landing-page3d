"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { cartReducer, initialState } from "./cartReducer";
import type {
    Product,
    CartItem,
    CheckoutStatus,
    MidtransTransaction,
} from "@/src/types/type";
import { CreateTransaction, sendLinkEmailPayment } from "@/src/server/actions/payment/action";

// ── Snap.js type augmentation ────────────────────────────────────────────────
declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options?: {
                    onSuccess?: (result: unknown) => void;
                    onPending?: (result: unknown) => void;
                    onError?: (result: unknown) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}

// ── Context shape ─────────────────────────────────────────────────────────────
type CartContextValue = {
    // State
    cart: CartItem[];
    checkoutStatus: CheckoutStatus;
    cartCount: number;
    cartTotal: number;
    // Actions
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    checkout: (
        customer?: MidtransTransaction["customer"],
        payment_method?: string
    ) => Promise<{ order_id: string; snap_token: string } | null>;
    loading: boolean;
    error: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);


// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const snapScriptLoaded = useRef(false);
    // Load Midtrans Snap.js once
    useEffect(() => {
        if (snapScriptLoaded.current) return;
        const clientKey =
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "SB-Mid-client-demo";
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", clientKey);
        script.async = true;
        document.head.appendChild(script);
        snapScriptLoaded.current = true;
    }, []);

    // Seed products on first mount and load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    dispatch({ type: "SET_CART", payload: parsed });
                }
            } catch (e) {
                console.error("Failed to parse saved cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(state.cart));
    }, [state.cart]);

    // Derived values
    const cartCount = state.cart.reduce((acc: number, i: CartItem) => acc + i.quantity, 0);
    const cartTotal = state.cart.reduce(
        (acc: number, i: CartItem) => acc + i.price * i.quantity,
        0
    );

    const addToCart = useCallback((product: Product) => {
        dispatch({ type: "ADD_TO_CART", payload: product });
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        dispatch({ type: "REMOVE_FROM_CART", payload: productId });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: "CLEAR_CART" });
    }, []);

    const checkout = useCallback(
        async (
            customer?: MidtransTransaction["customer"],
            payment_method?: string
        ): Promise<{ order_id: string; snap_token: string } | null> => {
            if (state.cart.length === 0) return null;

            dispatch({ type: "SET_CHECKOUT_STATUS", payload: "loading" });

            try {
                const payload: MidtransTransaction = {
                    order_id: `ORDER-${Date.now()}`,
                    gross_amount: cartTotal,
                    items: state.cart.map((item: CartItem) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    customer,
                    payment_method,
                };


                const snap_token = await CreateTransaction(payload);
                if (snap_token && customer?.email) {
                    await sendLinkEmailPayment(payload)
                }

                // Save order f
                // Save order for persistence (mock DB in localStorage)
                const pendingOrder = {
                    ...payload,
                    snap_token,
                    createdAt: new Date().toISOString(),
                    status: "pending"
                };
                const existingOrders = JSON.parse(localStorage.getItem("pending_orders") || "{}");
                existingOrders[payload.order_id] = pendingOrder;
                localStorage.setItem("pending_orders", JSON.stringify(existingOrders));

                dispatch({ type: "SET_SNAP_TOKEN", payload: snap_token });
                dispatch({ type: "SET_CHECKOUT_STATUS", payload: "idle" });

                return { order_id: payload.order_id, snap_token };
            } catch (err) {
                console.error("[checkout]", err);
                dispatch({ type: "SET_CHECKOUT_STATUS", payload: "error" });
                return null;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state.cart, cartTotal]
    );

    return (
        <CartContext.Provider
            value={{
                cart: state.cart,
                checkoutStatus: state.checkoutStatus,
                cartCount,
                cartTotal,
                addToCart,
                removeFromCart,
                clearCart,
                checkout,
                loading: state.loading,
                error: state.error,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCartContext(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within a <CartProvider>");
    }
    return ctx;
}
