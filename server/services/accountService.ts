import { userRepository } from '#server/repositories/userRepository'
import { getDatabase } from '#server/utils/database'
import { toSessionUser } from '#server/utils/authorization'
import type {
    SignUpInput,
    SignInInput,
    UpdateProfileInput,
    ChangeEmailInput,
    ChangePasswordInput
} from '#server/schemas/account'

let dummyHash: string | undefined
async function getDummyHash() {
    dummyHash ??= await hashPassword('dummy-password-1')
    return dummyHash
}

function rethrowDuplicate(error: any): never {
    const mysqlError = error?.cause?.code ? error.cause : error
    if (mysqlError?.code === 'ER_DUP_ENTRY') {
        if (String(mysqlError.sqlMessage).includes('uq_publisher_name')) {
            throw createError({
                statusCode: 409,
                message: 'This publisher name is already in use.'
            })
        }
        throw createError({
            statusCode: 409,
            message: 'An account with this email already exists.'
        })
    }
    throw error
}

export const accountService = {
    async signUp(input: SignUpInput) {
        const passwordHash = await hashPassword(input.password)

        try {
            const userId = await getDatabase().transaction(async (transaction) => {
                const id = await userRepository.createUser(
                    {
                        email: input.email,
                        passwordHash,
                        firstName: input.role === 'reader' ? input.firstName : null,
                        lastName: input.role === 'reader' ? input.lastName : null,
                        role: input.role
                    },
                    transaction
                )

                if (input.role === 'publisher') {
                    await userRepository.createPublisherProfile(
                        {
                            userId: id,
                            publisherName: input.publisherName,
                            description: input.publisherDescription
                        },
                        transaction
                    )
                }
                return id
            })

            const created = await userRepository.findById(userId)
            const publisherName = input.role === 'publisher' ? input.publisherName : null
            return toSessionUser(created!, publisherName)
        } catch (error) {
            rethrowDuplicate(error)
        }
    },

    async signIn(input: SignInInput) {
        const user = await userRepository.findByEmail(input.email)

        const valid = await verifyPassword(
            user ? user.passwordHash : await getDummyHash(),
            input.password
        )

        if (!user || !valid) {
            throw createError({
                statusCode: 401,
                message: 'Invalid email or password.'
            })
        }
        if (!user.isActive) {
            throw createError({
                statusCode: 403,
                message: 'This account has been deactivated.'
            })
        }

        let publisherName: string | null = null
        if (user.role === 'publisher') {
            const profile = await userRepository.findPublisherProfile(user.id)
            publisherName = profile?.publisherName ?? null
        }

        return toSessionUser(user, publisherName)
    },

    async getCurrentUser(userId: number) {
        const user = await userRepository.findById(userId)
        if (!user || !user.isActive) return null

        const publisherProfile = user.role === 'publisher'
            ? await userRepository.findPublisherProfile(userId)
            : null

        return {
            ...toSessionUser(user, publisherProfile?.publisherName),
            publisherProfile
        }
    },

    async updateProfile(userId: number, input: UpdateProfileInput) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'User not found.'
            })
        }

        try {
            await getDatabase().transaction(async (transaction) => {
                if (input.firstName || input.lastName) {
                    await userRepository.update(
                        userId,
                        {
                            firstName: input.firstName,
                            lastName: input.lastName
                        },
                        transaction
                    )
                }

                if (user.role === 'publisher' && (input.publisherName || input.publisherDescription !== undefined)) {
                    await userRepository.updatePublisherProfile(
                        userId,
                        {
                            publisherName: input.publisherName,
                            description: input.publisherDescription
                        },
                        transaction
                    )
                }
            })
        } catch (error) {
            rethrowDuplicate(error)
        }

        return this.getCurrentUser(userId)
    },

    async changeEmail(userId: number, input: ChangeEmailInput) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'User not found.'
            })
        }

        const valid = await verifyPassword(user.passwordHash, input.password)
        if (!valid) {
            throw createError({
                statusCode: 400,
                message: 'Invalid password. Cannot change email.'
            })
        }

        const newEmail = input.newEmail.toLowerCase().trim()
        if (user.email === newEmail) {
            throw createError({
                statusCode: 400,
                message: 'The new email must be different from your current email.'
            })
        }

        try {
            await userRepository.update(userId, { email: newEmail })
            return { email: newEmail }
        } catch (error) {
            rethrowDuplicate(error)
        }
    },

    async changePassword(userId: number, input: ChangePasswordInput) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'User not found.'
            })
        }

        const valid = await verifyPassword(user.passwordHash, input.currentPassword)
        if (!valid) {
            throw createError({
                statusCode: 400,
                message: 'Current password is incorrect.'
            })
        }

        const newPasswordHash = await hashPassword(input.newPassword)
        await userRepository.update(userId, { passwordHash: newPasswordHash })

        return { ok: true }
    },

    async deleteAccount(userId: number, passwordInput: string) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'User not found.'
            })
        }

        const valid = await verifyPassword(user.passwordHash, passwordInput)
        if (!valid) {
            throw createError({
                statusCode: 400,
                message: 'Incorrect password. Account deletion aborted.'
            })
        }

        try {
            await userRepository.delete(userId)
        } catch (error) {
            await userRepository.setActive(userId, false)
        }

        return { ok: true }
    }
}
