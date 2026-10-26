import { z } from 'zod'
import {
    idSchema,
    bookIdParamSchema,
    paginationSchema,
    bookStatusSchema,
    dateOnlySchema,
    emptyToUndefined,
    emptyToNull,
    toArray,
    toOptionalArray,
    atLeastOneField
} from '#server/schemas/common'

export { bookIdParamSchema }

const title = z.string().trim()
    .min(1, 'Title is required.')
    .max(255, 'Title is too long.')

const description = z.string().trim()
    .max(5000, 'Description is too long.')

const price = z
    .preprocess(
        (val) => (typeof val === 'number' ? String(val) : val),
        z.string().trim().regex(/^\d{1,8}(\.\d{1,2})?$/, 'Price must be a non-negative amount with at most 2 decimals.'),
    )
    .transform((val) => Number(val).toFixed(2))

const isbn = z.string().trim()
    .transform((val) => val.replace(/[\s-]/g, '').toUpperCase())
    .refine((val) => /^(\d{9}[\dX]|\d{13})$/.test(val), 'Invalid ISBN (expected ISBN-10 or ISBN-13).')

const publishedYear = z.coerce
    .number()
    .int()
    .min(1000, 'Invalid published year.')
    .refine((year) => year <= new Date().getFullYear() + 1, 'Published year is in the future.')

const authorName = z.string().trim()
    .min(1, 'Author name cannot be empty.')
    .max(200, 'Author name is too long.')

const authorList = z.array(authorName)
    .min(1, 'At least one author is required.')
    .max(10, 'Too many authors.')

const genreIdList = z.array(idSchema)
    .min(1, 'Select at least one genre.')
    .max(20, 'Too many genres.')

const categoryIdList = z.array(idSchema)
    .max(20, 'Too many categories.')

export const createBookSchema = z.object({
    title,
    description: z.preprocess(emptyToUndefined, description.optional()),
    price,
    languageId: idSchema,
    isbn: z.preprocess(emptyToUndefined, isbn.optional()),
    publishedYear: z.preprocess(emptyToUndefined, publishedYear.optional()),
    authors: z.preprocess(toArray, authorList),
    genreIds: z.preprocess(toArray, genreIdList),
    categoryIds: z.preprocess(toArray, categoryIdList)
})

const baseUpdateBookSchema = z.object({
    title,
    description: z.preprocess(emptyToNull, description.nullable()),
    price,
    languageId: idSchema,
    isbn: z.preprocess(emptyToNull, isbn.nullable()),
    publishedYear: z.preprocess(emptyToNull, publishedYear.nullable()),
    authors: z.preprocess(toOptionalArray, authorList.optional()),
    genreIds: z.preprocess(toOptionalArray, genreIdList.optional()),
    categoryIds: z.preprocess(toOptionalArray, categoryIdList.optional())
})

export const updateBookFieldsSchema = baseUpdateBookSchema.partial()

export const updateBookSchema = atLeastOneField(baseUpdateBookSchema)

export const publisherBookListQuerySchema = paginationSchema.extend({
    status: bookStatusSchema.optional(),
    search: z.string().trim().max(100).optional()
})

export const salesReportQuerySchema = z
    .object({
        from: dateOnlySchema.optional(),
        to: dateOnlySchema.optional(),
        bookId: idSchema.optional()
    })
    .refine((query) => !query.from || !query.to || query.from <= query.to, {
        message: '"from" must not be after "to".',
        path: ['to']
    })

export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookFieldsSchema>
export type PublisherBookListQuery = z.infer<typeof publisherBookListQuerySchema>
export type SalesReportQuery = z.infer<typeof salesReportQuerySchema>