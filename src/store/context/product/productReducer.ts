import { CartItem, ProductAction, ProductState } from "@/src/types/type";


export const initialState: ProductState = {
  products: [],
  checkoutStatus: "idle",
  snapToken: null,
  loading: false,
  error: null,
};

export function productReducer(
  state: ProductState,
  action: ProductAction
): ProductState {
  switch (action.type) {
    // ── Products ────────────────────────────────────────────────────────────
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "UPDATE_PRODUCT":
      const updatedProducts = state.products.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      return { ...state, products: updatedProducts };
    case "DELETE_PRODUCT":
      const existing = state.products.find((item) => item.id === action.payload);
      if (!existing) return state;

      const deletedProducts = existing
        ? state.products.filter((item) => item.id !== action.payload)
        : state.products;
      return { ...state, products: deletedProducts };

    default:
      return state;
    // ── Loading and Error ───────────────────────────────────────────────────
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

 

  

  }
}
