import type { ZodType } from 'zod'

export function validateInput<T>(schema: ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data)
    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Error',
            message: result.error.issues[0]?.message ?? 'Invalid input.',
            data: result.error.issues
        })
    }
    return result.data
}
