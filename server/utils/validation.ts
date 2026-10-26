import type { H3Event } from 'h3'
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

export async function validatedBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
    return validateInput(schema, await readBody(event))
}

export function validatedQuery<T>(event: H3Event, schema: ZodType<T>): T {
    return validateInput(schema, getQuery(event))
}

export function validatedParams<T>(event: H3Event, schema: ZodType<T>): T {
    return validateInput(schema, getRouterParams(event))
}
