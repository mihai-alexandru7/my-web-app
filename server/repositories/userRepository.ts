import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { publisherProfiles, users } from '#server/database/schema'

export type UserRecord = typeof users.$inferSelect
export type Role = UserRecord['role']

export type UserFilter = {
    search?: string
    role?: Role
    isActive?: boolean
}

export type UpdateUserData = Partial<{
    firstName: string
    lastName: string
    email: string
    passwordHash: string
}>

export type UpdatePublisherProfileData = Partial<{
    publisherName: string
    description: string | null
}>

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
                like(sql`concat(${users.lastName}, ' ', ${users.firstName})`, pattern),
                like(publisherProfiles.publisherName, pattern)
            )
            : undefined
    )
}

export const userRepository = {
    async findByEmail(
        email: string,
        executor: Executor = getDatabase()
    ): Promise<UserRecord | null> {
        const [user] = await executor
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase().trim()))
            .limit(1)
        return user ?? null
    },

    async findById(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<UserRecord | null> {
        const [user] = await executor
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1)
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
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [created] = await executor
            .insert(users)
            .values({
                ...data,
                email: data.email.toLowerCase().trim()
            })
            .$returningId()
        return created.id
    },

    async update(
        id: number,
        data: UpdateUserData,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .update(users)
            .set(data)
            .where(eq(users.id, id))
        return result.affectedRows > 0
    },

    async createPublisherProfile(
        data: { userId: number; publisherName: string; description?: string },
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .insert(publisherProfiles)
            .values({
                userId: data.userId,
                publisherName: data.publisherName,
                description: data.description ?? null
            })
    },

    async updatePublisherProfile(
        userId: number,
        data: UpdatePublisherProfileData,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .update(publisherProfiles)
            .set(data)
            .where(eq(publisherProfiles.userId, userId))
        return result.affectedRows > 0
    },

    async findPublisherProfile(
        userId: number,
        executor: Executor = getDatabase()
    ) {
        const [profile] = await executor
            .select()
            .from(publisherProfiles)
            .where(eq(publisherProfiles.userId, userId))
            .limit(1)
        return profile ?? null
    },

    async list(
        filter: UserFilter,
        options: { limit: number; offset: number },
        executor: Executor = getDatabase()
    ) {
        return executor
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isActive: users.isActive,
                createdAt: users.createdAt,
                publisherName: publisherProfiles.publisherName
            })
            .from(users)
            .leftJoin(publisherProfiles, eq(publisherProfiles.userId, users.id))
            .where(whereClause(filter))
            .orderBy(desc(users.createdAt), desc(users.id))
            .limit(options.limit)
            .offset(options.offset)
    },

    async countByFilter(
        filter: UserFilter,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(users)
            .leftJoin(publisherProfiles, eq(publisherProfiles.userId, users.id))
            .where(whereClause(filter))
        return row?.total ?? 0
    },

    async setActive(
        id: number,
        isActive: boolean,
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .update(users)
            .set({ isActive })
            .where(eq(users.id, id))
    }
}
