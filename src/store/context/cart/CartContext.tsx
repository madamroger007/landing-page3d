"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useEffect,
} from "react";
import { cartReducer, initialState } from "./cartReducer";
import type {
    Product,
    CartItem,
    CheckoutStatus,
    MidtransTransaction,
} from "@/src/types/type";
import { CreateTransaction, sendLinkEmailPayment } from "@/src/server/actions/payment/action";

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
    deleteFromCart: (productId: number) => void;
    clearCart: () => void;
    checkout: (
        customer?: MidtransTransaction["customer"],
        grossAmount?: number,
        payment_method?: string,
        card_token_id?: string
    ) => Promise<{ order_id: string; status: string; payment_data: Record<string, unknown> } | null>;
    loading: boolean;
    error: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);


// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

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

    const deleteFromCart = useCallback((productId: number) => {
        dispatch({ type: "DELETE_FROM_CART", payload: productId });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: "CLEAR_CART" });
    }, []);

    const checkout = useCallback(
        async (
            customer?: MidtransTransaction["customer"],
            grossAmount?: number,
            payment_method?: string,
            card_token_id?: string
        ): Promise<{ order_id: string; status: string; payment_data: Record<string, unknown> } | null> => {
            if (state.cart.length === 0) return null;

            dispatch({ type: "SET_CHECKOUT_STATUS", payload: "loading" });

            try {
                const payload: MidtransTransaction = {
                    order_id: `ORDER-${Date.now()}`,
                    gross_amount: grossAmount ?? cartTotal,
                    items: state.cart.map((item: CartItem) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        category: item.category || "Uncategorized",
                        image: item.image || "",
                        videoUrl: item.videoUrl || ""
                    })),
                    customer,
                    payment_method,
                    card_token_id,
                };


                const transaction = await CreateTransaction(payload);
                if (customer?.email) {
                    await sendLinkEmailPayment(payload)
                }

                // Save order f
                // Save order for persistence (mock DB in localStorage)
                const pendingOrder = {
                    ...payload,
                    ...(transaction.payment_data || {}),
                    createdAt: new Date().toISOString(),
                    status: transaction.status || "pending"
                };
                const existingOrders = JSON.parse(localStorage.getItem("pending_orders") || "{}");
                existingOrders[payload.order_id] = pendingOrder;
                localStorage.setItem("pending_orders", JSON.stringify(existingOrders));

                dispatch({ type: "SET_CHECKOUT_STATUS", payload: "idle" });

                return {
                    order_id: payload.order_id,
                    status: transaction.status,
                    payment_data: transaction.payment_data || {},
                };
            } catch (err) {
                console.error("[checkout]", err);
                dispatch({
                    type: "SET_ERROR",
                    payload: err instanceof Error ? err.message : "Checkout failed",
                });
                dispatch({ type: "SET_CHECKOUT_STATUS", payload: "error" });
                return null;
            }
        },
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
                deleteFromCart,
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
