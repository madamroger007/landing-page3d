import { ProductAction, ProductState } from "@/src/types/type";


export const initialState: ProductState = {
  products: [],
  categories: [],
  tools: [],
  checkoutStatus: "idle",
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

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] };
    // ── Categories ──────────────────────────────────────────────────────────

    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "UPDATE_CATEGORY":
      const updatedCategories = state.categories.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
      return { ...state, categories: updatedCategories };
    case "DELETE_CATEGORY":
      const existingCategory = state.categories.find((item) => item.id === action.payload);
      if (!existingCategory) return state;
      const deletedCategories = existingCategory
        ? state.categories.filter((item) => item.id !== action.payload)
        : state.categories;
      return { ...state, categories: deletedCategories };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    // ── Tools ───────────────────────────────────────────────────────────────
    case "SET_TOOLS":
      return { ...state, tools: action.payload };
    case "UPDATE_TOOL":
      return {
        ...state,
        tools: state.tools.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case "DELETE_TOOL":
      return {
        ...state,
        tools: state.tools.filter((item) => item.id !== action.payload),
      };
    case "ADD_TOOL":
      return { ...state, tools: [...state.tools, action.payload] };
    // ── Loading and Error ───────────────────────────────────────────────────
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
