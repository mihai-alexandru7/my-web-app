import { changePasswordSchema } from '#server/schemas/account'
import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const body = await validatedBody(event, changePasswordSchema)

    await accountService.changePassword(user.id, body)
    return { ok: true, message: 'Password updated successfully.' }
})
