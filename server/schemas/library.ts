import { z } from 'zod'
import { idSchema } from '#server/schemas/common'

export const updateProgressSchema = z.object({
    lastPosition: z.string().trim().min(1).max(255)
})

export const collectionSchema = z.object({
    name: z.string().trim().min(1, 'Collection name is required.').max(100)
})

export const collectionBookParamSchema = z.object({
    id: idSchema,
    bookId: idSchema
})

export const reviewSchema = z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(2000).optional()
}).refine(data => data.rating !== undefined || (data.comment && data.comment.length > 0), {
    message: 'Provide at least a rating or a comment.'
})

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>
export type CollectionInput = z.infer<typeof collectionSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
