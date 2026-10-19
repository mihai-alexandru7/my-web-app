import { z } from 'zod'

const pagination = {
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
}

const optionalId = z.coerce.number().int().positive().optional()

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
})

export const genreSchema = z.object({
    name: z.string().trim().min(1, 'Name is required.').max(100, 'Name is too long.'),
})

export const categorySchema = z.object({
    name: z.string().trim().min(1, 'Name is required.').max(100, 'Name is too long.'),
})

const languageCode = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z]{2}$/, 'Use a 2-letter language code (e.g. "en", "ro").')

const languageName = z.string().trim().min(1, 'Name is required.').max(50, 'Name is too long.')

export const languageSchema = z.object({
    code: languageCode,
    name: languageName,
})

export const languageUpdateSchema = z
    .object({ code: languageCode, name: languageName })
    .partial()
    .refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update.')

export const bookListQuerySchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'withdrawn']).default('pending'),
    ...pagination,
})

export const rejectBookSchema = z.object({
    reason: z.string().trim().min(1, 'Please provide a reason.').max(500, 'The reason is too long.'),
})

export const reviewListQuerySchema = z.object({
    bookId: optionalId,
    userId: optionalId,
    ...pagination,
})

export const userListQuerySchema = z.object({
    search: z.string().trim().max(100).optional(),
    role: z.enum(['reader', 'publisher', 'administrator']).optional(),
    isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    ...pagination,
})

export const userStatusSchema = z.object({
    isActive: z.boolean(),
})

export type BookListQuery = z.infer<typeof bookListQuerySchema>
