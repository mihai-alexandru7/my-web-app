import { changeEmailSchema } from '#server/schemas/account'
import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const sessionUser = await requireActiveUser(event)
    const body = await validatedBody(event, changeEmailSchema)

    const result = await accountService.changeEmail(sessionUser.id, body)

    await replaceUserSession(event, {
        user: { ...sessionUser, email: result.email },
    })

    return { ok: true, email: result.email }
})
