import type { H3Event } from 'h3'

export type Role = 'reader' | 'publisher' | 'administrator'

export async function requireRole(event: H3Event, ...roles: Role[]) {
    const { user } = await requireUserSession(event)
    if (!roles.includes(user.role)) {
        throw createError({ statusCode: 403, message: 'You do not have permission to perform this action.' })
    }
    return user
}
