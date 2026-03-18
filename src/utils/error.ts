type BaseFormError = {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
};

export const formErrorStatement = <T extends BaseFormError>(
    response: { success: boolean; errors?: T; message?: string },
    setFormError: React.Dispatch<React.SetStateAction<T | null>>
) => {
    if (!response.success) {
        if (response.errors) {
            setFormError(response.errors);
        } else {
            setFormError({
                formErrors: [response.message || 'Operation failed'],
                fieldErrors: {},
            } as T);
        }
        return;
    }
};