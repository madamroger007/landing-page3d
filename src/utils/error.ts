import { ProductFormError } from "../components/dashboard/products";

export const formErrorStatement = (response: { success: boolean; errors?: ProductFormError; message: string }, setFormError: React.Dispatch<React.SetStateAction<ProductFormError | null>>) => {
    if (!response.success) {
        if (response.errors) {
            setFormError(response.errors);
        } else {
            setFormError({
                formErrors: [response.message || 'Operation failed'],
                fieldErrors: {},
            });
        }
        return;
    }
};