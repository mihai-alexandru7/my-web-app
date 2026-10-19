import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { getDb } from '../utils/db'
import type { Executor } from '../utils/db'
import { publisherProfiles, users } from '../database/schema'
import type { Role } from '../utils/authentication'

export type UserRecord = typeof users.$inferSelect
export type UserFilter = { search?: string; role?: Role; isActive?: boolean }

function escapeLike(value: string) {
    return value.replace(/[\\%_]/g, '\\$&')
}

function whereClause(filter: UserFilter) {
    const pattern = filter.search ? `%${escapeLike(filter.search)}%` : undefined
    return and(
        filter.role ? eq(users.role, filter.role) : undefined,
        filter.isActive === undefined ? undefined : eq(users.isActive, filter.isActive),
        pattern
            ? or(
                like(users.email, pattern),
                like(users.firstName, pattern),
                like(users.lastName, pattern),
                like(sql`concat(${users.firstName}, ' ', ${users.lastName})`, pattern),
            )
            : undefined,
    )
}

export const userRepository = {
    async findByEmail(email: string, executor: Executor = getDb()): Promise<UserRecord | null> {
        const [user] = await executor.select().from(users).where(eq(users.email, email)).limit(1)
        return user ?? null
    },

    async findById(id: number, executor: Executor = getDb()): Promise<UserRecord | null> {
        const [user] = await executor.select().from(users).where(eq(users.id, id)).limit(1)
        return user ?? null
    },

    async createUser(
        data: {
            email: string
            passwordHash: string
            firstName: string
            lastName: string
            role: Role
        },
        executor: Executor = getDb(),
    ): Promise<number> {
        const [created] = await executor.insert(users).values(data).$returningId()
        return created.id
    },

    async createPublisherProfile(
        data: { userId: number; publisherName: string; description?: string },
        executor: Executor = getDb(),
    ): Promise<void> {
        await executor.insert(publisherProfiles).values({
            userId: data.userId,
            publisherName: data.publisherName,
            description: data.description ?? null,
        })
    },

    async list(filter: UserFilter, options: { limit: number; offset: number }, executor: Executor = getDb()) {
        return executor
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isActive: users.isActive,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(whereClause(filter))
            .orderBy(desc(users.createdAt), desc(users.id))
            .limit(options.limit)
            .offset(options.offset)
    },

    async countByFilter(filter: UserFilter, executor: Executor = getDb()): Promise<number> {
        const [row] = await executor.select({ total: count() }).from(users).where(whereClause(filter))
        return row?.total ?? 0
    },

    async setActive(id: number, isActive: boolean, executor: Executor = getDb()): Promise<void> {
        await executor.update(users).set({ isActive }).where(eq(users.id, id))
    },

    async findPublisherProfile(userId: number, executor: Executor = getDb()) {
        const [profile] = await executor
            .select()
            .from(publisherProfiles)
            .where(eq(publisherProfiles.userId, userId))
            .limit(1)
        return profile ?? null
    },
}
