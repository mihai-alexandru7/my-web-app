import { userRepository } from '#server/repositories/userRepository'
import type { UserFilter, UserRecord } from '#server/repositories/userRepository'

function toAdminUser(user: UserRecord) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}

export const userManagementService = {
    async list(filter: UserFilter, page: number, pageSize: number) {
        const [items, total] = await Promise.all([
            userRepository.list(filter, { limit: pageSize, offset: (page - 1) * pageSize }),
            userRepository.countByFilter(filter)
        ])
        return { items, total, page, pageSize }
    },

    async getDetail(id: number) {
        const user = await userRepository.findById(id)
        if (!user) {
            throw createError({ statusCode: 404, message: 'User not found.' })
        }
        const publisherProfile = user.role === 'publisher' ? await userRepository.findPublisherProfile(id) : null
        return { ...toAdminUser(user), publisherProfile }
    },

    async setActive(id: number, isActive: boolean, adminId: number) {
        if (id === adminId && !isActive) {
            throw createError({ statusCode: 403, message: 'You cannot deactivate your own account.' })
        }
        const user = await userRepository.findById(id)
        if (!user) {
            throw createError({ statusCode: 404, message: 'User not found.' })
        }
        if (user.isActive !== isActive) {
            await userRepository.setActive(id, isActive)
        }
        return toAdminUser({ ...user, isActive })
    }
}
