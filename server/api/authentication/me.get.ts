import { authenticationService } from '../../services/authenticationService'

export default defineEventHandler(async (event) => {
    const { user: sessionUser } = await requireUserSession(event)
    const user = await authenticationService.getCurrentUser(sessionUser.id)
    if (!user) {
        await clearUserSession(event)
        throw createError({ statusCode: 401, message: 'Invalid session.' })
    }
    await replaceUserSession(event, { user })
    return { user }
})
