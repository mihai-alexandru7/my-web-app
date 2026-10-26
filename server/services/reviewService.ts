import { reviewRepository } from '#server/repositories/reviewRepository'
import { libraryRepository } from '#server/repositories/libraryRepository'
import type { ReviewInput } from '#server/schemas/library'

export const reviewService = {
    async addOrUpdate(userId: number, bookId: number, input: ReviewInput) {
        const hasPurchased = await libraryRepository.hasPurchased(userId, bookId)
        if (!hasPurchased) {
            throw createError({
                statusCode: 403,
                message: 'You can only rate or review books that you have purchased.'
            })
        }

        await reviewRepository.upsert({
            userId,
            bookId,
            rating: input.rating,
            comment: input.comment
        })

        return { ok: true }
    },

    async getUserReview(userId: number, bookId: number) {
        return reviewRepository.findByUserAndBook(userId, bookId)
    },

    async delete(userId: number, bookId: number) {
        const review = await reviewRepository.findByUserAndBook(userId, bookId)
        if (!review) {
            throw createError({ statusCode: 404, message: 'Review not found.' })
        }

        await reviewRepository.delete(review.id)
        return { ok: true }
    }
}