import { reviewRepository } from '#server/repositories/reviewRepository'
import type { ReviewFilter } from '#server/repositories/reviewRepository'

export const reviewManagementService = {
    async list(filter: ReviewFilter, page: number, pageSize: number) {
        const [items, total] = await Promise.all([
            reviewRepository.list(filter, { limit: pageSize, offset: (page - 1) * pageSize }),
            reviewRepository.count(filter)
        ])
        return { items, total, page, pageSize }
    },

    async remove(id: number) {
        const deleted = await reviewRepository.delete(id)
        if (!deleted) {
            throw createError({ statusCode: 404, message: 'Review not found.' })
        }
    }
}