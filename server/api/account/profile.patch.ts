import { updateProfileSchema } from '#server/schemas/account'
import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const { user: sessionUser } = await requireUserSession(event)
    const body = await readValidatedBody(event, updateProfileSchema.parse)

    const user = await accountService.updateProfile(sessionUser.id, body)
    if (user) {
        await replaceUserSession(event, { user })
    }
    return { user }
})
