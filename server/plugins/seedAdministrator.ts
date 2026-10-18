import { userRepository } from '../repositories/userRepository'

export default defineNitroPlugin(async () => {
    const { administratorEmail, administratorPassword } = useRuntimeConfig()
    if (!administratorEmail || !administratorPassword) return

    try {
        const email = String(administratorEmail).trim().toLowerCase()
        if (await userRepository.findByEmail(email)) return

        await userRepository.createUser({
            email,
            passwordHash: await hashPassword(String(administratorPassword)),
            firstName: '',
            lastName: '',
            role: 'administrator',
        })
        console.log(`Administrator account created: ${email}`)
    } catch (error) {
        console.error('Failed to create the administrator account:', error)
    }
})
