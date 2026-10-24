import { changePasswordSchema } from '#server/schemas/account'
import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const body = await readValidatedBody(event, changePasswordSchema.parse)

    await accountService.changePassword(user.id, body)
    return { ok: true, message: 'Password updated successfully.' }
})
