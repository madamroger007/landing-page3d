import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Orders } from "@/src/types/type";
import { DbOrderInfo } from "../types";
import { fetchDbOrderById, fetchPublicOrderById, readPendingOrderById, upsertPendingOrder } from "../utils";

type UseOrderDetailDataResult = {
    isHydrated: boolean;
    isResolvingOrder: boolean;
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

    const [orderState, setOrderState] = useState<{ orderId: string; item: Orders | null; checked: boolean } | null>(null);

    const order = useMemo(() => {
        if (!orderId || !orderState) return null;
        return orderState.orderId === orderId ? orderState.item : null;
    }, [orderId, orderState]);

    const isResolvingOrder = useMemo(() => {
        if (!isHydrated || !orderId) return false;
        if (!orderState) return true;
        if (orderState.orderId !== orderId) return true;
        return !orderState.checked;
    }, [isHydrated, orderId, orderState]);

    const [dbOrderState, setDbOrderState] = useState<{ orderId: string; item: DbOrderInfo | null } | null>(null);

    const dbOrder = useMemo(() => {
        if (!orderId) return null;
        if (!dbOrderState) return null;
        return dbOrderState.orderId === orderId ? dbOrderState.item : null;
    }, [dbOrderState, orderId]);

    useEffect(() => {
        if (!isHydrated || !orderId) return;

        let isActive = true;

        const resolveOrder = async () => {
            const localOrder = readPendingOrderById(orderId);

            if (localOrder) {
                if (!isActive) return;
                setOrderState({ orderId, item: localOrder, checked: true });
                return;
            }

            const serverOrder = await fetchPublicOrderById(orderId);

            if (!isActive) return;

            if (serverOrder) {
                upsertPendingOrder(serverOrder);
            }

            setOrderState({ orderId, item: serverOrder, checked: true });
        };

        const loadDbOrder = async () => {
            const item = await fetchDbOrderById(orderId);
            if (!isActive) return;
            setDbOrderState({ orderId, item });
        };

        void resolveOrder();
        void loadDbOrder();

        return () => {
            isActive = false;
        };
    }, [isHydrated, orderId]);

    return {
        isHydrated,
        isResolvingOrder,
        order,
        dbOrder,
    };
}