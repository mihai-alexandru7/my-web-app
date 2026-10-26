import { publisherBookRepository } from '#server/repositories/publisherBookRepository'
import { salesReportRepository } from '#server/repositories/salesReportRepository'
import type { SalesReportQuery } from '#server/schemas/publisher'

const DAY_MS = 24 * 60 * 60 * 1000

export const salesReportService = {
    async get(publisherId: number, query: SalesReportQuery) {
        if (query.bookId && !(await publisherBookRepository.findOwnedStatus(query.bookId, publisherId))) {
            throw createError({ statusCode: 404, message: 'Book not found.' })
        }

        const filter = {
            publisherId,
            bookId: query.bookId,
            from: query.from ? new Date(`${query.from}T00:00:00Z`) : undefined,
            to: query.to ? new Date(new Date(`${query.to}T00:00:00Z`).getTime() + DAY_MS) : undefined
        }

        const [summary, books, months] = await Promise.all([
            salesReportRepository.summary(filter),
            salesReportRepository.byBook(filter),
            salesReportRepository.byMonth(filter)
        ])

        return {
            period: { from: query.from ?? null, to: query.to ?? null },
            summary,
            books,
            months
        }
    }
}
