import type { H3Event } from 'h3'
import type { users } from '#server/database/schema'
import { userRepository } from '#server/repositories/userRepository'

export type UserRecord = typeof users.$inferSelect
export type Role = UserRecord['role']

export function toSessionUser(user: UserRecord, publisherName?: string | null) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        publisherName: publisherName ?? null,
        createdAt: user.createdAt
    }
}

export const ALL_ROLES: Role[] = ['reader', 'publisher', 'administrator']

/** Any signed-in user whose account is still active (re-checked against the database). */
export function requireActiveUser(event: H3Event) {
    return requireRole(event, ...ALL_ROLES)
}

export async function requireRole(event: H3Event, ...roles: Role[]) {
    const { user: sessionUser } = await requireUserSession(event)

    const user = await userRepository.findById(sessionUser.id)
    if (!user || !user.isActive) {
        await clearUserSession(event)
        throw createError({ statusCode: 401, message: 'Invalid session.' })
    }
    if (!roles.includes(user.role)) {
        throw createError({ statusCode: 403, message: 'You do not have permission to perform this action.' })
    }

    let publisherName: string | null = null
    if (user.role === 'publisher') {
        const profile = await userRepository.findPublisherProfile(user.id)
        publisherName = profile?.publisherName ?? null
    }

    return toSessionUser(user, publisherName)
}
