import { z } from 'zod'
import {
    idSchema,
    idParamSchema,
    paginationSchema,
    bookStatusSchema,
    userRoleSchema,
    booleanQueryParam,
    atLeastOneField
} from '#server/schemas/common'

export { idParamSchema }

const genreName = z.string().trim()
    .min(1, 'Name is required.')
    .max(100, 'Name is too long.')

export const genreSchema = z.object({
    name: genreName
})

const categoryName = z.string().trim()
    .min(1, 'Name is required.')
    .max(100, 'Name is too long.')

export const categorySchema = z.object({
    name: categoryName
})

const languageCode = z.string().trim().toLowerCase()
    .regex(/^[a-z]{2}$/, 'Use a 2-letter language code (e.g. "en", "ro").')

const languageName = z.string().trim()
    .min(1, 'Name is required.')
    .max(50, 'Name is too long.')

export const languageSchema = z.object({
    code: languageCode,
    name: languageName
})

export const languageUpdateSchema = atLeastOneField(languageSchema)

export const bookListQuerySchema = paginationSchema.extend({
    status: bookStatusSchema.default('pending')
})

export const rejectBookSchema = z.object({
    reason: z.string().trim()
        .min(1, 'Please provide a reason.')
        .max(500, 'The reason is too long.')
})

export const reviewListQuerySchema = paginationSchema.extend({
    bookId: idSchema.optional(),
    userId: idSchema.optional()
})

export const userListQuerySchema = paginationSchema.extend({
    search: z.string().trim().max(100).optional(),
    role: userRoleSchema.optional(),
    isActive: booleanQueryParam.optional()
})

export const userStatusSchema = z.object({
    isActive: z.boolean()
})

export type BookListQuery = z.infer<typeof bookListQuerySchema>
export type UserListQuery = z.infer<typeof userListQuerySchema>
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>