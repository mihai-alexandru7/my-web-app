import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const { user: sessionUser } = await requireUserSession(event)
    const user = await accountService.getCurrentUser(sessionUser.id)
    if (!user) {
        await clearUserSession(event)
        throw createError({
            statusCode: 401,
            message: 'Invalid session.'
        })
    }
    await replaceUserSession(event, { user })
    return { user }
})
