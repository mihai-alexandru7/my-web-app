import { reviewRepository } from '../repositories/reviewRepository'
import type { ReviewFilter } from '../repositories/reviewRepository'

export const reviewModerationService = {
    async list(filter: ReviewFilter, page: number, pageSize: number) {
        const [items, total] = await Promise.all([
            reviewRepository.list(filter, { limit: pageSize, offset: (page - 1) * pageSize }),
            reviewRepository.countByFilter(filter),
        ])
        return { items, total, page, pageSize }
    },

    async remove(id: number) {
        const deleted = await reviewRepository.delete(id)
        if (!deleted) {
            throw createError({ statusCode: 404, message: 'Review not found.' })
        }
    },
}
