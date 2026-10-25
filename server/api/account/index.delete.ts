import { z } from 'zod'
import { accountService } from '#server/services/accountService'

const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required to confirm account deletion.')
})

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const body = await readValidatedBody(event, deleteAccountSchema.parse)

    await accountService.deleteAccount(user.id, body.password)
    await clearUserSession(event)

    return { ok: true }
})
