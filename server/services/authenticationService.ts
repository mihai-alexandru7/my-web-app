import { userRepository } from '../repositories/userRepository'
import { getDb } from '../utils/db'
import { toSessionUser } from '../utils/authentication'
import type { LoginInput, RegisterInput } from '../schemas/authentication'

let dummyHash: string | undefined
async function getDummyHash() {
    dummyHash ??= await hashPassword('dummy-password-1')
    return dummyHash
}

function rethrowDuplicate(error: any): never {
    const mysqlError = error?.cause?.code ? error.cause : error
    if (mysqlError?.code === 'ER_DUP_ENTRY') {
        if (String(mysqlError.sqlMessage).includes('uq_publisher_name')) {
            throw createError({ statusCode: 409, message: 'This publisher name is already in use.' })
        }
        throw createError({ statusCode: 409, message: 'An account with this email already exists.' })
    }
    throw error
}

export const authenticationService = {
    async register(input: RegisterInput) {
        const passwordHash = await hashPassword(input.password)

        try {
            const userId = await getDb().transaction(async (tx) => {
                const id = await userRepository.createUser({
                    email: input.email,
                    passwordHash,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    role: input.role,
                }, tx)

                if (input.role === 'publisher') {
                    await userRepository.createPublisherProfile({
                        userId: id,
                        publisherName: input.publisherName,
                        description: input.publisherDescription,
                    }, tx)
                }
                return id
            })

            const created = await userRepository.findById(userId)
            return toSessionUser(created!)
        } catch (error) {
            rethrowDuplicate(error)
        }
    },

    async login(input: LoginInput) {
        const user = await userRepository.findByEmail(input.email)

        const valid = await verifyPassword(
            user ? user.passwordHash : await getDummyHash(),
            input.password,
        )

        if (!user || !valid) {
            throw createError({ statusCode: 401, message: 'Invalid email or password.' })
        }
        if (!user.isActive) {
            throw createError({ statusCode: 403, message: 'This account has been deactivated.' })
        }
        return toSessionUser(user)
    },

    async getCurrentUser(userId: number) {
        const user = await userRepository.findById(userId)
        if (!user || !user.isActive) return null
        return toSessionUser(user)
    },
}
