import { Order } from '@/src/types/type';

export type OrderLabel = 'progress' | 'revisi' | 'done';

export type ManageOrderFilters = {
    q: string;
    label: '' | OrderLabel;
};

export type OrderApiResponse = {
    orders: Order[];
};

export type UpdateLabelResult = {
    success: boolean;
    order?: Order;
    error?: string;
};

export type UpdateWorkflowInput = {
    orderLabel?: OrderLabel;
    productLink?: string;
};
