import { z } from 'zod'
import { paginationSchema, idSchema } from '#server/schemas/common'

export const bookstoreQuerySchema = paginationSchema.extend({
    search: z.string().trim().max(100).optional(),
    genreId: idSchema.optional(),
    categoryId: idSchema.optional(),
    languageId: idSchema.optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sortBy: z.enum(['newest', 'price-asc', 'price-desc', 'title']).default('newest')
})

export type BookstoreQuery = z.infer<typeof bookstoreQuerySchema>
