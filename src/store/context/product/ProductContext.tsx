"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { productReducer, initialState } from "./productReducer";
import type {
  Product,
} from "@/src/types/type";
import { getProducts } from "@/src/server/actions/products/action";

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
type ProductContextValue = {
  // State
  products: Product[];


  // Actions
  setProducts: (products: Product[]) => void;
  updateProduct: (productId: Product) => void;

  deleteProduct: (productId: number) => void;
  loading: boolean;
  error: string | null;
};

const ProductContext = createContext<ProductContextValue | null>(null);


// ── Provider ──────────────────────────────────────────────────────────────────
export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Seed products on first mount and load cart from localStorage
  useEffect(() => {
    const products = localStorage.getItem("products")
    if (products) {
      dispatch({ type: "SET_PRODUCTS", payload: JSON.parse(products) });

    } else {
      getProducts().then((data) => {
        dispatch({ type: "SET_PRODUCTS", payload: data.products });
        localStorage.setItem("products", JSON.stringify(data.products));
      });

    }

  }, []);

  useEffect(() => {
    // Sync products to localStorage whenever they change
    localStorage.setItem("products", JSON.stringify(state.products));
  }, [state.products]);


  // Actions
  const setProducts = useCallback((products: Product[]) => {
    dispatch({ type: "SET_PRODUCTS", payload: products });
  }, []);

  const updateProduct = useCallback((product: Product) => {
    dispatch({ type: "UPDATE_PRODUCT", payload: product });
  }, []);


  const deleteProduct = useCallback((productId: number) => {
    dispatch({ type: "DELETE_PRODUCT", payload: productId });
  }, []);


  return (
    <ProductContext.Provider
      value={{
        products: state.products,
        setProducts,
        updateProduct,
        deleteProduct,
        loading: state.loading,
        error: state.error,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useProductContext(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProduct must be used within a <ProductProvider>");
  }
  return ctx;
}
