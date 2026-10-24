import { signInSchema } from '#server/schemas/account'
import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, signInSchema.parse)
    const user = await accountService.signIn(body)
    await setUserSession(event, { user })
    return { user }
})
