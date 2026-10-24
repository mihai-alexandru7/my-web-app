import { z } from 'zod'

export const idSchema = z.coerce
    .number()
    .int('ID must be an integer.')
    .positive('ID must be a positive number.')

export const optionalIdSchema = idSchema.optional()

export const idParamSchema = z.object({
    id: idSchema
})

export const bookIdParamSchema = idParamSchema

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const BOOK_STATUSES = ['pending', 'approved', 'rejected', 'withdrawn'] as const
export const bookStatusSchema = z.enum(BOOK_STATUSES)

export const USER_ROLES = ['reader', 'publisher', 'administrator'] as const
export const userRoleSchema = z.enum(USER_ROLES)

export const emptyToUndefined = (val: unknown) =>
    typeof val === 'string' && val.trim() === '' ? undefined : val

export const emptyToNull = (val: unknown) =>
    typeof val === 'string' && val.trim() === '' ? null : val

export const toArray = (val: unknown) =>
    val === undefined ? [] : Array.isArray(val) ? val : [val]

export const atLeastOneField = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.partial().refine(
        (data) => Object.keys(data).length > 0,
        'Provide at least one field to update.'
    )

export const booleanQueryParam = z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')

function isRealDate(value: string) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(Date.UTC(year!, month! - 1, day))
    return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day
}

export const dateOnlySchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the YYYY-MM-DD format.')
    .refine(isRealDate, 'Invalid calendar date.')