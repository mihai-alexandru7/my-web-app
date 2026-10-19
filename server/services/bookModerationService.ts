import { bookRepository } from '../repositories/bookRepository'
import type { BookStatus } from '../repositories/bookRepository'
import { getDb } from '../utils/db'

async function failTransition(id: number, rule: string): Promise<never> {
    const current = await bookRepository.findStatus(id)
    if (!current) {
        throw createError({ statusCode: 404, message: 'Book not found.' })
    }
    throw createError({ statusCode: 409, message: `${rule} (current status: ${current}).` })
}

async function review(
    id: number,
    data: { status: 'approved' | 'rejected'; reviewerId: number; rejectionReason?: string },
) {
    const updated = await bookRepository.reviewIfPending(id, data)
    if (updated) return { id, status: data.status }
    return failTransition(id, 'Only pending books can be reviewed')
}

export const bookModerationService = {
    async list(status: BookStatus, page: number, pageSize: number) {
        const [items, total] = await Promise.all([
            bookRepository.listByStatus(status, { limit: pageSize, offset: (page - 1) * pageSize }),
            bookRepository.countByStatus(status),
        ])
        return { items, total, page, pageSize }
    },

    async getDetail(id: number) {
        const book = await bookRepository.findDetailById(id)
        if (!book) {
            throw createError({ statusCode: 404, message: 'Book not found.' })
        }
        return book
    },

    approve(id: number, reviewerId: number) {
        return review(id, { status: 'approved', reviewerId })
    },

    reject(id: number, reviewerId: number, reason: string) {
        return review(id, { status: 'rejected', reviewerId, rejectionReason: reason })
    },

    async withdraw(id: number, reviewerId: number) {
        const withdrawn = await getDb().transaction(async (tx) => {
            const updated = await bookRepository.withdrawIfApproved(id, { reviewerId }, tx)
            if (updated) await bookRepository.removeFromCarts(id, tx)
            return updated
        })
        if (withdrawn) return { id, status: 'withdrawn' as const }
        return failTransition(id, 'Only approved books can be withdrawn')
    },
}
