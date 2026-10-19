import { userRepository } from '../repositories/userRepository'

export default defineNitroPlugin(async () => {
    const { administratorEmail, administratorPassword } = useRuntimeConfig()
    if (!administratorEmail || !administratorPassword) return

    try {
        const email = String(administratorEmail).trim().toLowerCase()

        const existing = await userRepository.findByEmail(email)
        if (existing) {
            if (existing.role !== 'administrator') {
                console.warn(
                    `Seed skipped: ${email} already exists with role "${existing.role}". ` +
                    'Use a different administrator email or change the role manually.',
                )
            }
            return
        }

        await userRepository.createUser({
            email,
            passwordHash: await hashPassword(String(administratorPassword)),
            firstName: 'Administrator',
            lastName: 'Account',
            role: 'administrator',
        })
        console.log(`Administrator account created: ${email}`)
    } catch (error) {
        console.error('Failed to create the administrator account:', error)
    }
})
