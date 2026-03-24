import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Orders } from "@/src/types/type";
import { DbOrderInfo } from "../types";
import { fetchDbOrderById, readPendingOrderById } from "../utils";

type UseOrderDetailDataResult = {
    isHydrated: boolean;
    order: Orders | null;
    dbOrder: DbOrderInfo | null;
};

export function useOrderDetailData(orderId: string): UseOrderDetailDataResult {
    const isHydrated = useSyncExternalStore(
        () => () => {
            return;
        },
        () => true,
        () => false
    );

    const order = useMemo(() => {
        if (!isHydrated || !orderId) return null;
        return readPendingOrderById(orderId);
    }, [isHydrated, orderId]);

    const [dbOrderState, setDbOrderState] = useState<{ orderId: string; item: DbOrderInfo | null } | null>(null);

    const dbOrder = useMemo(() => {
        if (!orderId) return null;
        if (!dbOrderState) return null;
        return dbOrderState.orderId === orderId ? dbOrderState.item : null;
    }, [dbOrderState, orderId]);

    useEffect(() => {
        if (!isHydrated || !orderId) return;

        let isActive = true;

        const loadDbOrder = async () => {
            const item = await fetchDbOrderById(orderId);
            if (!isActive) return;
            setDbOrderState({ orderId, item });
        };

        void loadDbOrder();

        return () => {
            isActive = false;
        };
    }, [isHydrated, orderId]);

    return {
        isHydrated,
        order,
        dbOrder,
    };
}