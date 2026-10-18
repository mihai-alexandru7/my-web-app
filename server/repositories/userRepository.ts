import { eq } from 'drizzle-orm'
import { getDb } from '../utils/db'
import type { Executor } from '../utils/db'
import { publisherProfiles, users } from '../database/schema'
import type { Role } from '../utils/authentication'

export type UserRecord = typeof users.$inferSelect

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
}
