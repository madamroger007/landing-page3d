import { CartItem, CartState, ProductAction } from "@/src/types/type";


export const initialState: CartState = {
  cart: [],
  checkoutStatus: "idle",
  snapToken: null,
  loading: false,
  error: null,
};

export function cartReducer(
  state: CartState,
  action: ProductAction
): CartState {
  switch (action.type) {
    default:
      return state;
    // ── Loading and Error ───────────────────────────────────────────────────
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    // ── Cart ────────────────────────────────────────────────────────────────
    case "ADD_TO_CART": {
      const existing = state.cart.find((item) => item.id === action.payload.id);
      let updatedCart: CartItem[];

      if (existing) {
        updatedCart = state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...state.cart, { ...action.payload, quantity: 1 }];
      }

      return { ...state, cart: updatedCart };
    }

    case "REMOVE_FROM_CART": {
      const existing = state.cart.find((item) => item.id === action.payload);
      if (!existing) return state;

      const updatedCart =
        existing.quantity > 1
          ? state.cart.map((item) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          : state.cart.filter((item) => item.id !== action.payload);

      return { ...state, cart: updatedCart };
    }

    case "CLEAR_CART":
      return { ...state, cart: [], snapToken: null, checkoutStatus: "idle" };

    case "SET_CART":
      return { ...state, cart: action.payload };

  }
}
