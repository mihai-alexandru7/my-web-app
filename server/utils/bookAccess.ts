import type { H3Event } from 'h3'
import { bookRepository } from '#server/repositories/bookRepository'
import { userRepository } from '#server/repositories/userRepository'

/**
 * Covers and free samples of approved books are public. Everything else (pending,
 * rejected or withdrawn books) is visible only to the owning publisher, administrators
 * and readers who already bought the book (they keep it in their library).
 */
export async function canViewBookAsset(
    event: H3Event,
    book: { id: number; publisherId: number; status: string }
): Promise<boolean> {
    if (book.status === 'approved') return true

    const { user: sessionUser } = await getUserSession(event)
    if (!sessionUser) return false

    const user = await userRepository.findById(sessionUser.id)
    if (!user || !user.isActive) return false
    if (user.role === 'administrator') return true
    if (user.role === 'publisher') return book.publisherId === user.id
    return bookRepository.hasPurchased(user.id, book.id)
}
