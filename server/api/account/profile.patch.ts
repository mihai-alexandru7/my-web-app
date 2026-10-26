import { updateProfileSchema } from '#server/schemas/account'
import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const sessionUser = await requireActiveUser(event)
    const body = await validatedBody(event, updateProfileSchema)

    const user = await accountService.updateProfile(sessionUser.id, body)
    if (user) {
        await replaceUserSession(event, { user })
    }
    return { user }
})
