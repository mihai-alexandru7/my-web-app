import type { H3Event } from 'h3'
import type { users } from '../database/schema'
import { userRepository } from '../repositories/userRepository'

export type UserRecord = typeof users.$inferSelect
export type Role = UserRecord['role']

export function toSessionUser(user: UserRecord) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    }
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
    return toSessionUser(user)
}
