import { z } from 'zod';

export const toolSchema = z.object({
    name: z
        .string()
        .min(2, 'Tool name must be at least 2 characters')
        .max(50, 'Tool name cannot exceed 50 characters'),
});

export type ToolSchema = z.infer<typeof toolSchema>;

export interface ZodErrorToolSchema {
    formErrors: string[];
    fieldErrors: {
        name?: string[];
    };
}
